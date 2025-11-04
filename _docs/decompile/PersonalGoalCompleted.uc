// Full name: DBGame.DBMasterServer.PersonalGoalCompleted
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
Performing command: 'obj decompile PersonalGoalCompleted '
function PersonalGoalCompleted()
{
	local @NULL P;

	CurrentGoalRole = int(P.GetCurrentGoalRole());
	// End:0x51
	if(__NFUN_129__(P.CurrentGoalAvailable()))
	{
		return;
	}
	CurrentPersonalGoal = P.PersonalGoals[CurrentGoalRole];
	// End:0xAB
	if(__NFUN_154__(CurrentPersonalGoal.Id, -1))
	{
		return;
	}
	Connection = getConnection();
	openConnections.AddItem(Connection);
	Address = __NFUN_112__(__NFUN_112__(__NFUN_112__(__NFUN_112__("http://", Host), ":"), string(Port)), "/completePersonalGoal");
	Message = new Class'Engine.JsonObject';
	Message.SetStringValue("steamid", Class'Engine.OnlineSubsystem'.static.UniqueNetIdToString(P.UniqueId));
	Message.SetIntValue("goalid", CurrentPersonalGoal.Id);
	Connection.SetURL(Address);
	Connection.SetContentAsString(Message.EncodeJson(Message));
	Connection.SetProcessRequestCompleteDelegate(endGameReportCallback);
	Connection.ProcessRequest();
	//return;	
}
