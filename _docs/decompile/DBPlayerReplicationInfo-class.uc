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
Performing command: 'obj decompile DBPlayerReplicationInfo '
class DBPlayerReplicationInfo extends UTPlayerReplicationInfo
	hidecategories(Navigation,Movement,Collision);

function ();

defaultproperties
{
	readyForNextMatch=true
	assetHat=(asset_definition_id=0,Parameters=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[1]=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[2]=(Name="",Color=/* ERROR: System.ArgumentException */))
	assetSkin=(asset_definition_id=0,Parameters=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[1]=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[2]=(Name="",Color=/* ERROR: System.ArgumentException */))
	assetSkinFaceEyes=(asset_definition_id=0,Parameters=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[1]=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[2]=(Name="",Color=/* ERROR: System.ArgumentException */))
	assetSkinFaceBeard=(asset_definition_id=0,Parameters=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[1]=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[2]=(Name="",Color=/* ERROR: System.ArgumentException */))
	assetGun=(asset_definition_id=0,Parameters=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[1]=(Name="",Color=/* ERROR: System.ArgumentException */),Parameters[2]=(Name="",Color=/* ERROR: System.ArgumentException */))
	PersonalGoals[0]=(Id=-1,DisplayName="",Type=GoalType.Pass,Value=0,XPReward=0,Progress=0,Complete=false)
	PersonalGoals[1]=(Id=-1,DisplayName="",Type=GoalType.Pass,Value=0,XPReward=0,Progress=0,Complete=false)
	Rank=-1
	elo=-1
	Position=-1
	server_xp=-1
	f3v3XpRatio=0.6000000
	xp_goal=20
	xp_assist=20
	xp_pass_max=20
	xp_pass_min=1
	xp_pass_max_distance=8000
	xp_intercept_min=5
	xp_intercept_max=30
	intercept_max_distance_from_own_goal=4000
	xp_ko_done=10
	xp_save_min=5
	xp_save_max=30
	xp_miss_min=1
	xp_miss_max=20
	xpAddedRemainingLifeTimeDefault=4.5000000
	save_and_chance_time_threshold=1.1000000
	intercept_time_threshold=1.5000000
	GameMessageClass=Class'DBGame.DBGameMessage'
}
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
UELib.DeserializationException: PropertyTag value deserialization error for 'Color
 ---> System.ArgumentException: Requested value '1_1065353215' was not found.
   at System.Enum.TryParseByName[TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TStorage& result)
   at System.Enum.TryParseByValueOrName[TUnderlying,TStorage](RuntimeType enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, TUnderlying& result)
   at System.Enum.TryParse(Type enumType, ReadOnlySpan`1 value, Boolean ignoreCase, Boolean throwOnFailure, Object& result)
   at System.Enum.Parse(Type enumType, String value, Boolean ignoreCase)
   at UELib.Core.UDefaultProperty.DeserializeTagUE3()
   at UELib.Core.UDefaultProperty.DeserializeNextTag()
   at UELib.Core.UDefaultProperty.Deserialize()
   at UELib.Core.UDefaultProperty.LegacyDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   at UELib.Core.UDefaultProperty.TryDeserializeDefaultPropertyValue(PropertyType type, DeserializeFlags deserializeFlags)
   --- End of inner exception stack trace ---
