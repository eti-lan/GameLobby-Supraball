Package Version:868/0
Build:Default
Branch:UELib.Branch.DefaultEngineBranch
Header Size: 920927
Package Flags:0x1:AllowDownload;0x8:Cooked;0x200000:ContainsScript;0x80000;
Names Count:7447 Names Offset:129 Exports Count:9154 Exports Offset:261839 Imports Count:2324 Imports Offset:196767
GUID:E19A166E4C74A6BE8280DF938401EBAB
Generations Count:1
EngineVersion:12791
CookerVersion:136
CompressionFlags:0
PackageSource:338559195
Performing command: 'obj decompile DBGameReplicationInfo '
class DBGameReplicationInfo extends GameReplicationInfo
	config(Game)
	hidecategories(Navigation,Movement,Collision);

function ();

defaultproperties
{
	TeamColors[0]=/* ERROR: System.ArgumentOutOfRangeException */
	TeamColors[1]=/* ERROR: System.ArgumentOutOfRangeException */
	eventMessageTeam=255
	winTeam=255
	shotClockTeamindex=255
	circleBlockRadius=850.0000000
	reconnectSpawnDelay=15
	teamChangeCooldown=10
}
UELib.DeserializationException: PropertyTag value deserialization error for 'TeamColors
 ---> System.ArgumentOutOfRangeException: Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')
   at System.Collections.Generic.List`1.get_Item(Int32 index)
   at UELib.UnrealReader.ReadName()
   at UELib.UObjectStream.ReadName()
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
PropertyTag value size error for '.TeamColors: Expected: 16, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'TeamColors
 ---> System.ArgumentOutOfRangeException: Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')
   at System.Collections.Generic.List`1.get_Item(Int32 index)
   at UELib.UnrealReader.ReadName()
   at UELib.UObjectStream.ReadName()
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
PropertyTag value size error for '.TeamColors: Expected: 16, Actual: 8
