// Full name: DBGame.DBTCPMasterServerConnection.prepare
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
Performing command: 'obj decompile prepare '
function prepare()
{
	local @NULL Data;

	// End:0x29
	if(__NFUN_242__(getGame().isMatchMaking(), false))
	{
		return;
	}
	json_players = Data.GetObject("players").ObjectArray;
	dbac = DBAccessControl(getGame().AccessControl);
	dbac.allowed_players.Length = 0;
	// End:0x4DE
	foreach json_players(Player)
	{
		// End:0x1EB
		if(__NFUN_122__(Player.GetStringValue("id"), botid))
		{
			bot_info.elo = Player.GetIntValue("elo");
			bot_info.pos = Player.GetIntValue("pos");
			// End:0x1D1
			if(__NFUN_154__(Player.GetIntValue("team"), 0))
			{
				alpha_bots.AddItem(bot_info);				
			}
			else
			{
				beta_bots.AddItem(bot_info);
			}
			continue;			
		}
		else
		{
			DBPRI = getGame().getPRI(Player.GetStringValue("id"));
			// End:0x32F
			if(__NFUN_119__(DBPRI, none))
			{
				DBPRI.Rank = Class'DBGame.DBRankDef'.static.rankFromElo(Player.GetIntValue("elo"));
				DBPRI.elo = Player.GetIntValue("elo");
				DBPRI.Position = Player.GetIntValue("pos");
			}
			// End:0x4DD
			if(Class'Engine.OnlineSubsystem'.static.StringToUniqueNetId(Player.GetStringValue("id"), UniqueId))
			{
				net_player.Id = UniqueId;
				net_player.Team = Player.GetIntValue("team");
				net_player.Position = Player.GetIntValue("pos");
				dbac.allowed_players.AddItem(net_player);
				__NFUN_231__(__NFUN_168__(__NFUN_168__(__NFUN_168__(__NFUN_168__(__NFUN_168__("Added:", Class'Engine.OnlineSubsystem'.static.UniqueNetIdToString(UniqueId)), "to team"), string(net_player.Team)), "position"), string(net_player.Position)));
			}			
		}
	}	
	// End:0x54B
	if(__NFUN_129__(getGame().__NFUN_281__('MatchOver')))
	{
		self.adjustBotCount(0, alpha_bots);
		self.adjustBotCount(1, beta_bots);
	}
	//return;	
}
