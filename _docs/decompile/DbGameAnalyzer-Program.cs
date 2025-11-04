using System; 
using System.IO; 
using System.Linq; 
using UELib; 
using UELib.Core; 
 
namespace DbGameAnalyzer 
{ 
    class Program 
    { 
        static void Main(string[] args) 
        { 
            Console.WriteLine("?? DBGame.u Spectator/NetID Analyzer"); 
            Console.WriteLine("======================================"); 
 
            try 
            { 
                // Copy DBGame.u to current directory 
                var dbGamePath = "..\\..\\..\\UDKGame\\CookedPC\\DBGame.u"; 
                if (File.Exists(dbGamePath)) 
                { 
                    File.Copy(dbGamePath, "DBGame.u", true); 
                    Console.WriteLine("? DBGame.u copied"); 
                } 
 
                // Load the package 
                using var package = UnrealPackage.LoadPackage("DBGame.u"); 
                Console.WriteLine($"? Loaded: {package.PackageName} (Version: {package.Version})"); 
                Console.WriteLine($"?? Total objects: {package.Objects.Count}"); 
 
                // Create output directory 
                Directory.CreateDirectory("decompiled"); 
 
                // Find and analyze key functions 
                AnalyzeSpectatorFunctions(package); 
                AnalyzeNetIDFunctions(package); 
                AnalyzeTeamFunctions(package); 
 
                Console.WriteLine("\\n? Analysis complete! Check 'decompiled' folder."); 
            } 
            catch (Exception ex) 
            { 
                Console.WriteLine($"? Error: {ex.Message}"); 
            } 
 
            Console.WriteLine("\\nPress any key to exit..."); 
            Console.ReadKey(); 
        } 
 
        static void AnalyzeSpectatorFunctions(UnrealPackage package) 
        { 
            Console.WriteLine("\\n?? SPECTATOR FUNCTIONS:"); 
            var spectatorKeywords = new[] { "spectator", "prelogin", "postlogin", "login" }; 
 
            foreach (var obj in package.Objects) 
            { 
                if (obj is UFunction function) 
                { 
                    var name = function.Name.ToLower(); 
                    if (spectatorKeywords.Any(kw => name.Contains(kw))) 
                    { 
                        Console.WriteLine($"  ?? {function.GetOuterName()}.{function.Name}"); 
                        try 
                        { 
                            var code = function.Decompile(); 
                            File.WriteAllText($"decompiled/spectator_{function.Name}.uc", code); 
                            Console.WriteLine($"    ? Decompiled"); 
 
                            // Look for spectator assignments 
                            if (code.Contains("bSpectator") || code.Contains("Spectator onyl")) 
                            { 
                                Console.WriteLine($"    ?? CONTAINS SPECTATOR LOGIC!"); 
                            } 
                        } 
                        catch (Exception ex) 
                        { 
                            Console.WriteLine($"    ? Decompile failed: {ex.Message}"); 
                        } 
                    } 
                } 
            } 
        } 
 
        static void AnalyzeNetIDFunctions(UnrealPackage package) 
        { 
            Console.WriteLine("\\n?? NETID FUNCTIONS:"); 
            var netidKeywords = new[] { "netid", "uniquenetid", "getplayerinfo", "validate", "steamid" }; 
 
            foreach (var obj in package.Objects) 
            { 
                if (obj is UFunction function) 
                { 
                    var name = function.Name.ToLower(); 
                    if (netidKeywords.Any(kw => name.Contains(kw))) 
                    { 
                        Console.WriteLine($"  ?? {function.GetOuterName()}.{function.Name}"); 
                        try 
                        { 
                            var code = function.Decompile(); 
                            File.WriteAllText($"decompiled/netid_{function.Name}.uc", code); 
                            Console.WriteLine($"    ? Decompiled"); 
 
                            // Look for HTTP/master server communication 
                            if (code.Contains("BetaMasterHost") || code.Contains("getPlayerInfo") || code.Contains("http")) 
                            { 
                                Console.WriteLine($"    ?? CONTAINS MASTER SERVER LOGIC!"); 
                            } 
                        } 
                        catch (Exception ex) 
                        { 
                            Console.WriteLine($"    ? Decompile failed: {ex.Message}"); 
                        } 
                    } 
                } 
            } 
        } 
 
        static void AnalyzeTeamFunctions(UnrealPackage package) 
        { 
            Console.WriteLine("\\n?? TEAM FUNCTIONS:"); 
            var teamKeywords = new[] { "team", "changeteam", "setteam", "assignteam" }; 
 
            foreach (var obj in package.Objects) 
            { 
                if (obj is UFunction function) 
                { 
                    var name = function.Name.ToLower(); 
                    if (teamKeywords.Any(kw => name.Contains(kw))) 
                    { 
                        Console.WriteLine($"  ?? {function.GetOuterName()}.{function.Name}"); 
                        try 
                        { 
                            var code = function.Decompile(); 
                            File.WriteAllText($"decompiled/team_{function.Name}.uc", code); 
                            Console.WriteLine($"    ? Decompiled"); 
                        } 
                        catch (Exception ex) 
                        { 
                            Console.WriteLine($"    ? Decompile failed: {ex.Message}"); 
                        } 
                    } 
                } 
            } 
        } 
    } 
} 
