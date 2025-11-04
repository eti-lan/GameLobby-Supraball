using System; 
using System.IO; 
using UELib; 
using UELib.Core; 
 
namespace SupraballAnalysis 
{ 
    class Program 
    { 
        static void Main(string[] args) 
        { 
            Console.WriteLine("?? Supraball DBGame.u Analysis with Unreal-Library"); 
            Console.WriteLine("=================================================="); 
 
            try 
            { 
                var package = UnrealPackage.LoadPackage("DBGame.u"); 
                Console.WriteLine($"? Loaded package: {package.PackageName}"); 
                Console.WriteLine($"?? Objects: {package.Objects.Count}"); 
 
                // Find spectator-related functions 
                Console.WriteLine("\\n?? Searching for spectator-related functions..."); 
                SearchForSpectatorFunctions(package); 
 
                // Find NetID validation functions 
                Console.WriteLine("\\n?? Searching for NetID validation functions..."); 
                SearchForNetIDFunctions(package); 
 
                // Find team assignment functions 
                Console.WriteLine("\\n?? Searching for team assignment functions..."); 
                SearchForTeamFunctions(package); 
 
                // Export decompiled code 
                Console.WriteLine("\\n?? Exporting decompiled code..."); 
                ExportDecompiledCode(package); 
 
            } 
            catch (Exception ex) 
            { 
                Console.WriteLine($"? Error: {ex.Message}"); 
            } 
 
            Console.WriteLine("\\n? Analysis complete! Check output files."); 
            Console.ReadKey(); 
        } 
 
        static void SearchForSpectatorFunctions(UnrealPackage package) 
        { 
            var spectatorFunctions = new List<string>(); 
 
            foreach (var obj in package.Objects) 
            { 
                if (obj is UFunction function) 
                { 
                    var name = function.Name.ToLower(); 
                    if (name.Contains("spectator") || name.Contains("prelogin") || name.Contains("postlogin")) 
                    { 
                        Console.WriteLine($"  ?? {function.GetOuterName()}.{function.Name}"); 
                        spectatorFunctions.Add($"{function.GetOuterName()}.{function.Name}"); 
 
                        // Try to decompile the function 
                        try 
                        { 
                            var code = function.Decompile(); 
                            File.WriteAllText($"spectator_{function.Name}.uc", code); 
                            Console.WriteLine($"    ? Decompiled to spectator_{function.Name}.uc"); 
                        } 
                        catch 
                        { 
                            Console.WriteLine($"    ? Failed to decompile {function.Name}"); 
                        } 
                    } 
                } 
            } 
 
            File.WriteAllLines("spectator_functions.txt", spectatorFunctions); 
        } 
 
        static void SearchForNetIDFunctions(UnrealPackage package) 
        { 
            var netidFunctions = new List<string>(); 
 
            foreach (var obj in package.Objects) 
            { 
                if (obj is UFunction function) 
                { 
                    var name = function.Name.ToLower(); 
                    if (name.Contains("netid") || name.Contains("uniquenetid") || name.Contains("validate") || name.Contains("getplayerinfo")) 
                    { 
                        Console.WriteLine($"  ?? {function.GetOuterName()}.{function.Name}"); 
                        netidFunctions.Add($"{function.GetOuterName()}.{function.Name}"); 
 
                        try 
                        { 
                            var code = function.Decompile(); 
                            File.WriteAllText($"netid_{function.Name}.uc", code); 
                            Console.WriteLine($"    ? Decompiled to netid_{function.Name}.uc"); 
                        } 
                        catch 
                        { 
                            Console.WriteLine($"    ? Failed to decompile {function.Name}"); 
                        } 
                    } 
                } 
            } 
 
            File.WriteAllLines("netid_functions.txt", netidFunctions); 
        } 
 
        static void SearchForTeamFunctions(UnrealPackage package) 
        { 
            var teamFunctions = new List<string>(); 
 
            foreach (var obj in package.Objects) 
            { 
                if (obj is UFunction function) 
                { 
                    var name = function.Name.ToLower(); 
                    if (name.Contains("team") || name.Contains("changeteam") || name.Contains("assignteam")) 
                    { 
                        Console.WriteLine($"  ?? {function.GetOuterName()}.{function.Name}"); 
                        teamFunctions.Add($"{function.GetOuterName()}.{function.Name}"); 
 
                        try 
                        { 
                            var code = function.Decompile(); 
                            File.WriteAllText($"team_{function.Name}.uc", code); 
                            Console.WriteLine($"    ? Decompiled to team_{function.Name}.uc"); 
                        } 
                        catch 
                        { 
                            Console.WriteLine($"    ? Failed to decompile {function.Name}"); 
                        } 
                    } 
                } 
            } 
 
            File.WriteAllLines("team_functions.txt", teamFunctions); 
        } 
 
        static void ExportDecompiledCode(UnrealPackage package) 
        { 
            File.WriteAllText("dbgame_full_decompile.uc", package.Decompile()); 
        } 
    } 
} 
