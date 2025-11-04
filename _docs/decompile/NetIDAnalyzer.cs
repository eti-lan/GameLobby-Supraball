using System;
using System.IO;
using UELib;
using UELib.Core;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace NetIDAnalysis
{
    class NetIDAnalyzer
    {
        static void Main(string[] args)
        {
            Console.WriteLine("?? NetID Generation Analysis - UDK/Steam NetID Reverse Engineering");
            Console.WriteLine("================================================================");
            
            try
            {
                var package = UnrealPackage.LoadPackage("DBGame.u");
                Console.WriteLine($"?? Loaded: {package.PackageName} ({package.Objects.Count} objects)");
                
                // Search for NetID generation code
                FindNetIDGeneration(package);
                
                // Search for Steam integration
                FindSteamIntegration(package);
                
                // Search for Online Subsystem code
                FindOnlineSubsystem(package);
                
                // Search for PlayerReplicationInfo NetID handling
                FindPlayerReplicationNetID(package);
                
                // ?? NEW: Search for HTTP/Master Server Communication
                FindHTTPMasterServerCode(package);
                
                // ?? NEW: Search for DBAccessControl configuration
                FindDBAccessControlConfig(package);
                
                Console.WriteLine("\n? Analysis complete - check output files for NetID generation code!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"? Error: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
            }
            
            Console.ReadKey();
        }
        
        static void FindNetIDGeneration(UnrealPackage package)
        {
            Console.WriteLine("\n?? Searching for NetID Generation Functions...");
            var findings = new List<string>();
            
            foreach (var obj in package.Objects)
            {
                if (obj is UFunction function)
                {
                    var name = function.Name.ToLower();
                    
                    // Look for NetID generation patterns
                    if (name.Contains("generatenetid") || 
                        name.Contains("createnetid") ||
                        name.Contains("getuniquenetid") ||
                        name.Contains("steamid") ||
                        name.Contains("uniqueid"))
                    {
                        Console.WriteLine($"  ?? FOUND: {function.GetOuterName()}.{function.Name}");
                        findings.Add($"{function.GetOuterName()}.{function.Name}");
                        
                        try
                        {
                            var code = function.Decompile();
                            File.WriteAllText($"netid_gen_{function.Name}.uc", code);
                            
                            // Look for specific patterns in the code
                            AnalyzeNetIDCode(code, function.Name);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"    ? Failed to decompile: {ex.Message}");
                        }
                    }
                }
                
                // Also check properties for NetID-related stuff
                if (obj is UProperty property)
                {
                    var name = property.Name.ToLower();
                    if (name.Contains("netid") || name.Contains("uniqueid") || name.Contains("steamid"))
                    {
                        Console.WriteLine($"  ?? Property: {property.GetOuterName()}.{property.Name} ({property.GetType().Name})");
                        findings.Add($"PROPERTY: {property.GetOuterName()}.{property.Name}");
                    }
                }
            }
            
            File.WriteAllLines("netid_generation_findings.txt", findings);
        }
        
        static void FindSteamIntegration(UnrealPackage package)
        {
            Console.WriteLine("\n?? Searching for Steam Integration...");
            var steamFindings = new List<string>();
            
            foreach (var obj in package.Objects)
            {
                if (obj.Name.ToLower().Contains("steam") ||
                    obj.Name.ToLower().Contains("online") ||
                    obj.Name.ToLower().Contains("subsystem"))
                {
                    Console.WriteLine($"  ?? STEAM/ONLINE: {obj.GetOuterName()}.{obj.Name} ({obj.GetType().Name})");
                    steamFindings.Add($"{obj.GetType().Name}: {obj.GetOuterName()}.{obj.Name}");
                    
                    if (obj is UFunction steamFunc)
                    {
                        try
                        {
                            var code = steamFunc.Decompile();
                            File.WriteAllText($"steam_{steamFunc.Name}.uc", code);
                            
                            // Look for NetID patterns in Steam code
                            AnalyzeSteamNetIDCode(code, steamFunc.Name);
                        }
                        catch { }
                    }
                }
            }
            
            File.WriteAllLines("steam_integration_findings.txt", steamFindings);
        }
        
        static void FindOnlineSubsystem(UnrealPackage package)
        {
            Console.WriteLine("\n?? Searching for OnlineSubsystem NetID handling...");
            var onlineFindings = new List<string>();
            
            foreach (var obj in package.Objects)
            {
                if (obj is UClass uclass && 
                    (uclass.Name.ToLower().Contains("online") || 
                     uclass.Name.ToLower().Contains("player") ||
                     uclass.Name.ToLower().Contains("replication")))
                {
                    Console.WriteLine($"  ?? Class: {uclass.Name}");
                    onlineFindings.Add($"CLASS: {uclass.Name}");
                    
                    // Get all functions in this class
                    foreach (var member in uclass.Children)
                    {
                        if (member is UFunction func && 
                            func.Name.ToLower().Contains("netid"))
                        {
                            Console.WriteLine($"    ?? Method: {func.Name}");
                            onlineFindings.Add($"  METHOD: {func.Name}");
                            
                            try
                            {
                                var code = func.Decompile();
                                File.WriteAllText($"online_{func.Name}.uc", code);
                            }
                            catch { }
                        }
                    }
                }
            }
            
            File.WriteAllLines("online_subsystem_findings.txt", onlineFindings);
        }
        
        static void FindPlayerReplicationNetID(UnrealPackage package)
        {
            Console.WriteLine("\n?? Searching for PlayerReplicationInfo NetID...");
            var priFindings = new List<string>();
            
            foreach (var obj in package.Objects)
            {
                if (obj.Name.ToLower().Contains("playerreplication") ||
                    obj.Name.ToLower().Contains("playerinfo") ||
                    obj.Name.ToLower().Contains("gameinfo"))
                {
                    Console.WriteLine($"  ?? Player Info: {obj.Name} ({obj.GetType().Name})");
                    priFindings.Add($"{obj.GetType().Name}: {obj.Name}");
                    
                    if (obj is UClass priClass)
                    {
                        // Look for NetID properties in PlayerReplicationInfo
                        foreach (var member in priClass.Children)
                        {
                            if (member.Name.ToLower().Contains("netid") ||
                                member.Name.ToLower().Contains("uniqueid"))
                            {
                                Console.WriteLine($"    ?? NetID Property: {member.Name}");
                                priFindings.Add($"  NETID_PROPERTY: {member.Name}");
                            }
                        }
                    }
                }
            }
            
            File.WriteAllLines("player_replication_netid_findings.txt", priFindings);
        }
        
        static void AnalyzeNetIDCode(string code, string functionName)
        {
            Console.WriteLine($"    ?? Analyzing NetID code in {functionName}...");
            
            // Look for hex patterns like 0x01100001
            var hexPattern = @"0x[0-9A-Fa-f]+";
            var hexMatches = Regex.Matches(code, hexPattern);
            
            if (hexMatches.Count > 0)
            {
                Console.WriteLine($"    ?? Found hex constants:");
                foreach (Match match in hexMatches)
                {
                    Console.WriteLine($"      • {match.Value}");
                }
            }
            
            // Look for Steam base ID patterns
            if (code.Contains("76561198") || code.Contains("0x0110000"))
            {
                Console.WriteLine($"    ?? STEAM BASE ID FOUND in {functionName}!");
            }
            
            // Look for bit operations
            if (code.Contains("<<") || code.Contains(">>") || code.Contains("&") || code.Contains("|"))
            {
                Console.WriteLine($"    ?? Bit operations found - likely NetID manipulation");
            }
        }
        
        static void AnalyzeSteamNetIDCode(string code, string functionName)
        {
            Console.WriteLine($"    ?? Analyzing Steam NetID code in {functionName}...");
            
            // Look for Steam ID conversion patterns
            var steamPatterns = new[]
            {
                @"76561198\d+",  // Steam ID 64
                @"0x0110000[0-9A-Fa-f]+", // Steam NetID hex format
                @"AccountID",
                @"SteamID",
                @"UniqueNetId"
            };
            
            foreach (var pattern in steamPatterns)
            {
                if (Regex.IsMatch(code, pattern, RegexOptions.IgnoreCase))
                {
                    Console.WriteLine($"    ?? Steam pattern found: {pattern}");
                }
            }
        }
        
        // ?? NEW: Find HTTP/Master Server Communication code
        static void FindHTTPMasterServerCode(UnrealPackage package)
        {
            Console.WriteLine("\n?? Searching for HTTP/Master Server Communication...");
            var httpFindings = new List<string>();
            
            foreach (var obj in package.Objects)
            {
                if (obj is UFunction function)
                {
                    var name = function.Name.ToLower();
                    
                    // Look for HTTP/Master Server related functions
                    if (name.Contains("http") || 
                        name.Contains("getplayerinfo") ||
                        name.Contains("masterserver") ||
                        name.Contains("checklogin") ||
                        name.Contains("requestcallback"))
                    {
                        Console.WriteLine($"  ?? HTTP/Master: {function.GetOuterName()}.{function.Name}");
                        httpFindings.Add($"{function.GetOuterName()}.{function.Name}");
                        
                        try
                        {
                            var code = function.Decompile();
                            File.WriteAllText($"http_{function.Name}.uc", code);
                            
                            // Analyze HTTP patterns
                            AnalyzeHTTPCode(code, function.Name);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"    ? Failed to decompile HTTP function: {ex.Message}");
                        }
                    }
                }
                
                // Check for HTTP-related properties
                if (obj is UProperty property)
                {
                    var name = property.Name.ToLower();
                    if (name.Contains("betamasterhost") ||
                        name.Contains("betamasterport") ||
                        name.Contains("masterserver") ||
                        name.Contains("bmatchmaking"))
                    {
                        Console.WriteLine($"  ?? HTTP Config: {property.GetOuterName()}.{property.Name}");
                        httpFindings.Add($"CONFIG: {property.GetOuterName()}.{property.Name}");
                    }
                }
            }
            
            File.WriteAllLines("http_masterserver_findings.txt", httpFindings);
        }
        
        // ?? NEW: Find DBAccessControl configuration
        static void FindDBAccessControlConfig(UnrealPackage package)
        {
            Console.WriteLine("\n?? Searching for DBAccessControl Configuration...");
            var accessControlFindings = new List<string>();
            
            foreach (var obj in package.Objects)
            {
                // Look for DBAccessControl class specifically
                if (obj.Name.ToLower().Contains("dbaccesscontrol") ||
                    obj.Name.ToLower().Contains("accesscontrol"))
                {
                    Console.WriteLine($"  ?? ACCESS CONTROL CLASS: {obj.Name} ({obj.GetType().Name})");
                    accessControlFindings.Add($"{obj.GetType().Name}: {obj.Name}");
                    
                    if (obj is UClass accessClass)
                    {
                        // Get all properties and functions
                        foreach (var member in accessClass.Children)
                        {
                            var memberName = member.Name.ToLower();
                            
                            if (memberName.Contains("matchmaking") ||
                                memberName.Contains("masterserver") ||
                                memberName.Contains("getplayerinfo") ||
                                memberName.Contains("pickteam"))
                            {
                                Console.WriteLine($"    ?? CRITICAL MEMBER: {member.Name} ({member.GetType().Name})");
                                accessControlFindings.Add($"  MEMBER: {member.Name}");
                                
                                if (member is UFunction accessFunc)
                                {
                                    try
                                    {
                                        var code = accessFunc.Decompile();
                                        File.WriteAllText($"dbaccess_{accessFunc.Name}.uc", code);
                                        
                                        // Check if this function makes HTTP requests
                                        if (code.Contains("HTTP") || code.Contains("getPlayerInfo") || 
                                            code.Contains("master.supraball.net"))
                                        {
                                            Console.WriteLine($"    ?? HTTP REQUEST FOUND in {accessFunc.Name}!");
                                        }
                                    }
                                    catch { }
                                }
                            }
                        }
                    }
                }
            }
            
            File.WriteAllLines("dbaccess_control_findings.txt", accessControlFindings);
        }
        
        static void AnalyzeHTTPCode(string code, string functionName)
        {
            Console.WriteLine($"    ?? Analyzing HTTP code in {functionName}...");
            
            // Look for HTTP-related patterns
            var httpPatterns = new[]
            {
                @"http://[^\s]+",           // HTTP URLs
                @"getPlayerInfo",           // Our target endpoint
                @"master\.supraball\.net",  // Master server host
                @"8991",                    // Master server port
                @"steamid=",                // URL parameter
                @"bMatchmaking",            // Matchmaking flag
            };
            
            foreach (var pattern in httpPatterns)
            {
                if (Regex.IsMatch(code, pattern, RegexOptions.IgnoreCase))
                {
                    Console.WriteLine($"    ?? HTTP pattern found: {pattern}");
                    
                    // Extract the actual matches
                    var matches = Regex.Matches(code, pattern, RegexOptions.IgnoreCase);
                    foreach (Match match in matches)
                    {
                        Console.WriteLine($"      • {match.Value}");
                    }
                }
            }
            
            // Look for conditions that might prevent HTTP requests
            if (code.Contains("bMatchmaking") && code.Contains("false"))
            {
                Console.WriteLine($"    ?? WARNING: Matchmaking might be disabled in {functionName}!");
            }
        }
    }
}