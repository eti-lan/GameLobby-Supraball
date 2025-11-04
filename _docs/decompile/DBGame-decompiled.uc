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
Performing command: 'obj decompile DBGame '
Couldn't acquire array type for property tag 'DefaultInventory' in Class'DBGame.DBGame'.
Couldn't acquire array type for property tag 'MapPrefixes' in Class'DBGame.DBGame'.
Couldn't acquire array type for property tag 'DefaultMapPrefixes' in Class'DBGame.DBGame'.
class DBGame extends UTTeamGame
	config(Deathball)
	hidecategories(Navigation,Movement,Collision);

function ();

defaultproperties
{
	Version="0.16.5"
	MatchTitle="My Supraball Server"
	MatchDescription="I did not fill this out!"
	bLogStats=true
	bMatchmaking=true
	bGoldenGoal=true
	bAutoBotSkill=true
	RequiredKickVotesPercent=0.6000000
	RequiredKickVotesMin=3
	QueryPort=27015
	EndMatchDuration=30
	desired_bot_skill=1200
	interceptMaxXpLocations[0]=/* ERROR: System.ArgumentOutOfRangeException */
	interceptMaxXpLocations[1]=/* ERROR: System.ArgumentOutOfRangeException */
	preMatchTime=23
	RankedPlayerWaitingTime=120
	NormalPlayerWaitingTime=40
	JoinTimeRemaining="Time left for all players to join: "
	AbandonTimeRemaining="Time before match is abandoned: "
	minVotesForPublicVote=1
	bSpawnInTeamArea=true
	FlagKillMessageName="FLAGKILL"
	bScoreDeaths=false
	bUseClassicHUD=true
	Acronym="DB"
	Description="Supraball!"
	NetWait=1
	CountDown=0
	DefaultInventory=/* Array type was not detected. */
	MapPrefixes=/* Array type was not detected. */
	BotClass=Class'DBGame.DBBot'
	MidgameScorePanelTag="CTFPanel"
	DefaultPawnClass=Class'DBGame.DBPawn'
	HUDType=Class'DBGame.DBHud'
	GameName="Supraball"
	TimeLimit=15
	DeathMessageClass=Class'UTGame.UTTeamDeathMessage'
	GameMessageClass=Class'DBGame.DBGameMessage'
	AccessControlClass=Class'DBGame.DBAccessControl'
	BroadcastHandlerClass=Class'DBGame.DBBroadcastHandler'
	PlayerControllerClass=Class'DBGame.DBPlayerController'
	PlayerReplicationInfoClass=Class'DBGame.DBPlayerReplicationInfo'
	GameReplicationInfoClass=Class'DBGame.DBGameReplicationInfo'
	OnlineStatsWriteClass=Class'UTGame.UTStatsWriteCTF'
	OnlineGameSettingsClass=Class'UTGame.UTGameSettingsCTF'
	DefaultMapPrefixes=/* Array type was not detected. */
}
UELib.DeserializationException: PropertyTag value deserialization error for 'interceptMaxXpLocations
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
PropertyTag value size error for '.interceptMaxXpLocations: Expected: 12, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'interceptMaxXpLocations
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
PropertyTag value size error for '.interceptMaxXpLocations: Expected: 12, Actual: 8
PropertyTag value size error for '.DefaultInventory: Expected: 8, Actual: 4
PropertyTag value size error for '.MapPrefixes: Expected: 11, Actual: 4
PropertyTag value size error for '.DefaultMapPrefixes: Expected: 166, Actual: 4
