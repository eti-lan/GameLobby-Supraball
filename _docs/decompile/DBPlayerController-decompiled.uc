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
Performing command: 'obj decompile DBPlayerController '
Couldn't acquire array type for property tag 'Components' in Class'DBGame.DBPlayerController'.
class DBPlayerController extends UTPlayerController
	config(Game)
	hidecategories(Navigation);

function ();

defaultproperties
{
	Charge=0.5000000
	showMatchRole=true
	bCanCharge=true
	bCanQuickShot=true
	bCanLockPass=true
	bCanPull=true
	bCanDeflect=true
	bCanKick=true
	bCanMove=true
	bCanTurn=true
	bCanJump=true
	bCanDash=true
	effectDetailLevel=2
	selectedVisualPreset=1
	ChatSpamProtectionDelay=2.0000000
	ChatDelay=0.7500000
	audioMasterVolume=1.0000000
	Gamma=2.2000000
	AAType=-1
	matchRoleValue=-1
	// Reference: ForceFeedbackWaveform'DBGame.Default__DBPlayerController.ForceFeedbackWaveform7'
	// Archetype: ForceFeedbackWaveform'UTGame.Default__UTPlayerController.ForceFeedbackWaveform7'
	begin object name="ForceFeedbackWaveform7"
	end object
	CameraShakeShortWaveForm=ForceFeedbackWaveform7
	// Reference: ForceFeedbackWaveform'DBGame.Default__DBPlayerController.ForceFeedbackWaveform8'
	// Archetype: ForceFeedbackWaveform'UTGame.Default__UTPlayerController.ForceFeedbackWaveform8'
	begin object name="ForceFeedbackWaveform8"
	end object
	CameraShakeLongWaveForm=ForceFeedbackWaveform8
	CameraClass=Class'GameFramework.GamePlayerCamera'
	InputClass=Class'DBGame.DBPlayerInput'
	// Reference: CylinderComponent'DBGame.Default__DBPlayerController.CollisionCylinder'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'CollisionCylinder'
	// Archetype: CylinderComponent'UTGame.Default__UTPlayerController.CollisionCylinder'
	begin object name="CollisionCylinder"
		ReplacementPrimitive=none
	end object
	CylinderComponent=CollisionCylinder
	Components=/* Array type was not detected. */
	CollisionComponent=CollisionCylinder
}
PropertyTag value size error for '.Components: Expected: 8, Actual: 4
