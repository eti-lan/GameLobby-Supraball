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
Performing command: 'obj decompile ServerBecomeSpectator '
reliable server function ServerBecomeSpectator()
{
	local @NULL Game;

	Game = DBGame(WorldInfo.Game);
	// End:0x56
	if(Game.isMatchMaking())
	{
		return;
	}
	// End:0x1C9
	if(__NFUN_130__(__NFUN_130__(__NFUN_130__(__NFUN_130__(__NFUN_129__(PlayerReplicationInfo.bOnlySpectator), __NFUN_129__(WorldInfo.IsInSeamlessTravel())), HasClientLoadedCurrentWorld()), __NFUN_119__(Game, none)), Game.AllowBecomeSpectator(self)))
	{
		PlayerReplicationInfo.bOnlySpectator = true;
		__NFUN_166__(Game.NumPlayers);
		__NFUN_165__(Game.NumSpectators);
		Game.SetTeam(self, none, false);
		ClientBecameSpectator();
		UnPossess();
		Game.BroadcastLocalizedMessage(Game.GameMessageClass, 16, PlayerReplicationInfo);		
	}
	else
	{
		ReceiveLocalizedMessage(Game.GameMessageClass, 12);
	}
	//return;	
}
