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
Performing command: 'obj decompile ServerBecomeActivePlayerOnTeam '
reliable server function ServerBecomeActivePlayerOnTeam()
{
	local int TeamIndex;

	// End:0x43
	if(DBGame(WorldInfo.Game).isMatchMaking())
	{
		return;
	}
	Game = UTGame(WorldInfo.Game);
	// End:0x338
	if(__NFUN_130__(__NFUN_130__(__NFUN_130__(__NFUN_130__(PlayerReplicationInfo.bOnlySpectator, __NFUN_129__(WorldInfo.IsInSeamlessTravel())), HasClientLoadedCurrentWorld()), __NFUN_119__(Game, none)), Game.AllowBecomeActivePlayer(self)))
	{
		SetBehindView(false);
		FixFOV();
		ServerViewSelf();
		PlayerReplicationInfo.bOnlySpectator = false;
		__NFUN_166__(Game.NumSpectators);
		__NFUN_165__(Game.NumPlayers);
		PlayerReplicationInfo.Reset();
		BroadcastLocalizedMessage(Game.GameMessageClass, 1, PlayerReplicationInfo);
		// End:0x221
		if(Game.bTeamGame)
		{
			Game.ChangeTeam(self, TeamIndex, false);
		}
		// End:0x30C
		if(__NFUN_129__(Game.bDelayedStart))
		{
			Game.bRestartLevel = false;
			// End:0x2AA
			if(Game.bWaitingToStartMatch)
			{
				Game.StartMatch();				
			}
			else
			{
				Game.RestartPlayer(self);
			}
			Game.bRestartLevel = Game.default.bRestartLevel;			
		}
		else
		{
			__NFUN_113__('PlayerWaiting');
			ClientGotoState('PlayerWaiting');
		}
		ClientBecameActivePlayer();
	}
	//return;	
}
