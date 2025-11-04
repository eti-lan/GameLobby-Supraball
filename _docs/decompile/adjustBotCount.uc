// Full name: DBGame.DBTCPMasterServerConnection.adjustBotCount
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
Performing command: 'obj decompile adjustBotCount '
function adjustBotCount()
{
	local byte Team;

	// End:0x329
	foreach WorldInfo.AllControllers(Class'DBGame.DBBot', Bot)
	{
		// End:0x69
		if(__NFUN_155__(int(Bot.GetTeamNum()), int(Team)))
		{
			continue;			
		}
		DBPRI = DBPlayerReplicationInfo(Bot.PlayerReplicationInfo);
		result_index = desired_bots.Find('pos', DBPRI.Position);
		// End:0x1FB
		if(__NFUN_154__(result_index, -1))
		{
			// End:0x1F8
			if(__NFUN_129__(DBAccessControl(getGame().AccessControl).willBeTakenOver(Team, DBPRI.Position)))
			{
				__NFUN_231__(__NFUN_112__(__NFUN_112__(__NFUN_112__(__NFUN_112__(__NFUN_112__("Removing bot with skill ", string(Bot.current_skill_level)), " from team "), string(Team)), " position "), string(DBPRI.Position)));
				Bot.__NFUN_279__();
			}
			// End:0x328
			continue;
		}
		// End:0x313
		if(__NFUN_155__(DBPRI.elo, desired_bots[result_index].elo))
		{
			__NFUN_231__(__NFUN_112__(__NFUN_112__(__NFUN_112__(__NFUN_112__(__NFUN_112__("Adjusting bot skill from team ", string(Team)), ": "), string(Bot.current_skill_level)), " -> "), string(desired_bots[result_index].elo)));
			Bot.setSkillLevel(desired_bots[result_index].elo);
		}
		desired_bots.Remove(result_index, 1);		
	}	
	// End:0x48C
	foreach desired_bots(Info)
	{
		__NFUN_231__(__NFUN_168__(__NFUN_112__(__NFUN_112__(__NFUN_112__("Adding bot for team ", string(Team)), " with skill "), string(Info.elo)), string(Info.pos)));
		Bot = DBBot(getGame().AddBot(,, true, int(Team)));
		Bot.setSkillLevel(Info.elo);
		DBPlayerReplicationInfo(Bot.PlayerReplicationInfo).Position = Info.pos;		
	}	
	//return;	
}
