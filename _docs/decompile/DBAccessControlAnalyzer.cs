using System;
using System.IO;
using UELib;
using UELib.Core;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace DBAccessControlAnalysis
{
    class DBAccessControlAnalyzer
    {
        static void Main(string[] args)
        {
            Console.WriteLine("?? DBAccessControl Analysis - Why no HTTP requests?");
            Console.WriteLine("===================================================");
            
            try
            {
                var package = UnrealPackage.LoadPackage("DBGame.u");
                Console.WriteLine($"?? Loaded: {package.PackageName} ({package.Objects.Count} objects)");
                
                // Find DBAccessControl class specifically
                FindDBAccessControlClass(package);
                
                // Find where/how it's instantiated
                FindDBAccessControlInstantiation(package);
                
                // Find game info classes that might control it
                FindGameInfoClasses(package);
                
                Console.WriteLine("\n? Analysis complete - check output files!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"? Error: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
            }
            
            Console.ReadKey();
        }
        
        static void FindDBAccessControlClass(UnrealPackage package)
        {
            Console.WriteLine("\n?? Searching for DBAccessControl class...");
            
            foreach (var obj in package.Objects)
            {
                if (obj.Name.ToLower().Contains("dbaccesscontrol") ||
                    obj.Name.ToLower().Contains("accesscontrol"))
                {
                    Console.WriteLine($"  ?? FOUND: {obj.Name} ({obj.GetType().Name})");
                    
                    if (obj is UClass accessClass)
                    {
                        Console.WriteLine($"    ?? Class: {accessClass.Name}");
                        Console.WriteLine($"    ?? Parent: {accessClass.SuperField?.Name ?? "None"}");
                        
                        // Analyze all members
                        foreach (var member in accessClass.Children)
                        {
                            Console.WriteLine($"      • {member.Name} ({member.GetType().Name})");
                            
                            if (member is UFunction func)
                            {
                                try
                                {
                                    var code = func.Decompile();
                                    File.WriteAllText($"dbaccess_{func.Name}.uc", code);
                                    
                                    // Check for specific patterns
                                    if (code.Contains("CheckLoginOnMasterServer") ||
                                        code.Contains("GetPlayerInfo") ||
                                        code.Contains("bMatchmaking"))
                                    {
                                        Console.WriteLine($"        ?? CRITICAL FUNCTION: {func.Name}");
                                        AnalyzeAccessControlFunction(code, func.Name);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"        ? Failed to decompile {func.Name}: {ex.Message}");
                                }
                            }
                        }
                    }
                }
            }
        }
        
        static void FindDBAccessControlInstantiation(UnrealPackage package)
        {
            Console.WriteLine("\n?? Searching for DBAccessControl instantiation...");
            
            foreach (var obj in package.Objects)
            {
                if (obj is UFunction function)
                {
                    try
                    {
                        var code = function.Decompile();
                        
                        if (code.Contains("DBAccessControl") ||
                            code.Contains("AccessControl") ||
                            code.Contains("spawn") && code.Contains("Access"))
                        {
                            Console.WriteLine($"  ?? FOUND in {function.GetOuterName()}.{function.Name}");
                            File.WriteAllText($"instantiation_{function.Name}.uc", code);
                            
                            // Look for conditions that prevent instantiation
                            if (code.Contains("bMatchmaking") && code.Contains("false"))
                            {
                                Console.WriteLine($"    ?? WARNING: Matchmaking condition in {function.Name}!");
                            }
                        }
                    }
                    catch { }
                }
            }
        }
        
        static void FindGameInfoClasses(UnrealPackage package)
        {
            Console.WriteLine("\n?? Searching for GameInfo classes...");
            
            foreach (var obj in package.Objects)
            {
                if (obj.Name.ToLower().Contains("gameinfo") ||
                    obj.Name.ToLower().Contains("dbgame"))
                {
                    Console.WriteLine($"  ?? GAME CLASS: {obj.Name} ({obj.GetType().Name})");
                    
                    if (obj is UClass gameClass)
                    {
                        foreach (var member in gameClass.Children)
                        {
                            if (member.Name.ToLower().Contains("access") ||
                                member.Name.ToLower().Contains("matchmaking") ||
                                member.Name.ToLower().Contains("master"))
                            {
                                Console.WriteLine($"    ?? RELEVANT: {member.Name}");
                                
                                if (member is UFunction func)
                                {
                                    try
                                    {
                                        var code = func.Decompile();
                                        File.WriteAllText($"gameinfo_{func.Name}.uc", code);
                                    }
                                    catch { }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        static void AnalyzeAccessControlFunction(string code, string functionName)
        {
            Console.WriteLine($"        ?? Analyzing {functionName}:");
            
            // Look for conditions that prevent execution
            var conditions = new[]
            {
                @"if\s*\(\s*!?bMatchmaking",
                @"if\s*\(\s*!?bOfficialMatchmaking",
                @"if\s*\(\s*BetaMasterHost\s*==\s*""?""?",
                @"return\s+false",
                @"return\s*;",
            };
            
            foreach (var pattern in conditions)
            {
                if (Regex.IsMatch(code, pattern, RegexOptions.IgnoreCase))
                {
                    Console.WriteLine($"          ?? BLOCKING CONDITION: {pattern}");
                }
            }
            
            // Look for HTTP request code
            if (code.Contains("HTTP") || code.Contains("Request"))
            {
                Console.WriteLine($"          ? HTTP code found in {functionName}");
            }
            else
            {
                Console.WriteLine($"          ? NO HTTP code in {functionName}");
            }
        }
    }
}