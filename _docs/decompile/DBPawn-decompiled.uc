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
Performing command: 'obj decompile DBPawn '
Couldn't acquire array type for property tag 'Components' in Class'DBGame.DBPawn'.
class DBPawn extends UTPawn
	config(Game)
	hidecategories(Navigation);

function ();

defaultproperties
{
	showVicinityIndicator=true
	showRadar=true
	showMiddleRadar=true
	showHealth=true
	showDashBar=true
	showNameTags=true
	showChargeBar=true
	showCrosshair=true
	// Reference: DBAnimatedParam'DBGame.Default__DBPawn.knockoutViewAnimObj'
	begin object name="knockoutViewAnimObj" class=DBGame.DBAnimatedParam
		durationFadeOut=0.7000000
	end object
	knockoutViewAnim=knockoutViewAnimObj
	koDuration=3.0000000
	RoleValue=-1
	gravityBallOwner=1.3750000
	JumpZNormal=500.0000000
	JumpZKeeper=600.0000000
	JumpZBallOwner=500.0000000
	JumpZKeeperBallOwner=600.0000000
	GroundSpeedNormal=655.0000000
	GroundSpeedKeeper=803.0000000
	GroundSpeedBallOwner=512.0000000
	GroundSpeedKeeperBallOwner=616.0000000
	pickupRadius=160.0000000
	deflectRadius=150.0000000
	protectionTime=10.0000000
	fProtectionFader=1.0000000
	dodgeCooldown=3.5000000
	dodgeCooldownServer=2.5000000
	JumpDelay=0.0900000
	BehindDeflectSoundThreshold=0.3000000
	pushForceMin=2250.0000000
	pushLinMult=0.1000000
	pointerArrowColor[0]=/* ERROR: System.ArgumentOutOfRangeException */
	pointerArrowColor[1]=/* ERROR: System.ArgumentOutOfRangeException */
	dodgeColors[0]=/* ERROR: System.ArgumentOutOfRangeException */
	dodgeColors[1]=/* ERROR: System.ArgumentOutOfRangeException */
	dodgeColorsKeeper[0]=/* ERROR: System.ArgumentOutOfRangeException */
	dodgeColorsKeeper[1]=/* ERROR: System.ArgumentOutOfRangeException */
	MaxKnockoutHeight=700.0000000
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.JumpParticle0'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'JumpParticle0'
	begin object name="JumpParticle0" class=DBGame.DBParticleSystemComponent
		detailClass=2
		Template=ParticleSystem'DBBall.jumpsmoke'
		bAutoActivate=false
		ReplacementPrimitive=none
		AbsoluteRotation=true
	end object
	JumpEffect0=JumpParticle0
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.JumpParticle1'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'JumpParticle1'
	begin object name="JumpParticle1" class=DBGame.DBParticleSystemComponent
		detailClass=2
		Template=ParticleSystem'DBBall.jumpsmoke'
		bAutoActivate=false
		ReplacementPrimitive=none
		AbsoluteRotation=true
	end object
	JumpEffect1=JumpParticle1
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.DamageParticleSelf'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'DamageParticleSelf'
	begin object name="DamageParticleSelf" class=DBGame.DBParticleSystemComponent
		Template=ParticleSystem'DBBall.damagedego'
		bAutoActivate=false
		ReplacementPrimitive=none
	end object
	DamageEffectSelf=DamageParticleSelf
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.KnockedOutParticle'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'KnockedOutParticle'
	begin object name="KnockedOutParticle" class=DBGame.DBParticleSystemComponent
		Template=ParticleSystem'DBBall.KOsternchen'
		ReplacementPrimitive=none
		HiddenGame=true
		AbsoluteRotation=true
		Rotation=/* ERROR: System.ArgumentOutOfRangeException */
	end object
	KnockedOutEffect=KnockedOutParticle
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.PointerPlayerParticle'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'PointerPlayerParticle'
	begin object name="PointerPlayerParticle" class=DBGame.DBParticleSystemComponent
		Template=ParticleSystem'DBBall.beamdecalding2'
		bAutoActivate=false
		ReplacementPrimitive=none
		AbsoluteRotation=true
		Translation=/* ERROR: System.ArgumentOutOfRangeException */
		Rotation=/* ERROR: System.ArgumentOutOfRangeException */
		TickGroup=ETickingGroup.TG_EffectsUpdateWork
	end object
	PointerEffectOthers=PointerPlayerParticle
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.DodgeParticle'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'DodgeParticle'
	begin object name="DodgeParticle" class=DBGame.DBParticleSystemComponent
		detailClass=2
		Template=ParticleSystem'DBBall.dasheffect'
		bAutoActivate=false
		ReplacementPrimitive=none
		AbsoluteRotation=true
	end object
	dodgeEffect=DodgeParticle
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.feetEffectLeft'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'feetEffectLeft'
	begin object name="feetEffectLeft" class=DBGame.DBParticleSystemComponent
		detailClass=2
		Template=ParticleSystem'DBBall.CelebrateTrail'
		bAutoActivate=false
		ReplacementPrimitive=none
		AbsoluteRotation=true
	end object
	feetTrailEffectLeft=feetEffectLeft
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.feetEffectRight'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'feetEffectRight'
	begin object name="feetEffectRight" class=DBGame.DBParticleSystemComponent
		detailClass=2
		Template=ParticleSystem'DBBall.CelebrateTrail'
		bAutoActivate=false
		ReplacementPrimitive=none
		AbsoluteRotation=true
	end object
	feetTrailEffectRight=feetEffectRight
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.BallownerparticleSelf'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'BallownerparticleSelf'
	begin object name="BallownerparticleSelf" class=DBGame.DBParticleSystemComponent
		Template=ParticleSystem'DBBall.ballownerparticle2'
		ReplacementPrimitive=none
		Translation=/* ERROR: System.ArgumentOutOfRangeException */
	end object
	BallOwnerEffectSelf=BallownerparticleSelf
	// Reference: DBParticleSystemComponent'DBGame.Default__DBPawn.BOParticlesOthersSmoke'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'BOParticlesOthersSmoke'
	begin object name="BOParticlesOthersSmoke" class=DBGame.DBParticleSystemComponent
		detailClass=1
		Template=ParticleSystem'DBBall.Ballownerparticle3'
		ReplacementPrimitive=none
	end object
	BallOwnerEffectOthersSmoke=BOParticlesOthersSmoke
	// Reference: StaticMeshComponent'DBGame.Default__DBPawn.BallownerMeshComp'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'BallownerMeshComp'
	begin object name="BallownerMeshComp" class=Engine.StaticMeshComponent
		StaticMesh=StaticMesh'DBBall.Ballowner2'
		ReplacementPrimitive=none
		HiddenGame=true
		bOwnerNoSee=true
		CollideActors=false
		LightingChannels=(bInitialized=true,Dynamic=true)
		Scale=4.5000000
		TickGroup=ETickingGroup.TG_EffectsUpdateWork
	end object
	BallOwnerMesh=BallownerMeshComp
	// Reference: StaticMeshComponent'DBGame.Default__DBPawn.HatMeshComp'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'HatMeshComp'
	begin object name="HatMeshComp" class=Engine.StaticMeshComponent
		StaticMesh=StaticMesh'DBModel.fedora'
		ReplacementPrimitive=none
		bOwnerNoSee=true
		CollideActors=false
		LightingChannels=(bInitialized=true,Dynamic=true)
	end object
	HatMesh=HatMeshComp
	// Reference: CylinderComponent'DBGame.Default__DBPawn.CollisionCylinder'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'CollisionCylinder'
	// Archetype: CylinderComponent'UTGame.Default__UTPawn.CollisionCylinder'
	begin object name="CollisionCylinder"
		CollisionRadius=35.0000000
		ReplacementPrimitive=none
		AlwaysCheckCollision=true
		RBCollideWithChannels=(Untitled2=true)
	end object
	Team0Cylinder=CollisionCylinder
	// Reference: CylinderComponent'DBGame.Default__DBPawn.Team1CollisionCylinder'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'Team1CollisionCylinder'
	begin object name="Team1CollisionCylinder" class=Engine.CylinderComponent
		CollisionHeight=44.0000000
		CollisionRadius=35.0000000
		ReplacementPrimitive=none
		CollideActors=true
		AlwaysCheckCollision=true
		BlockActors=true
		BlockZeroExtent=false
		BlockNonZeroExtent=false
		RBCollideWithChannels=(Untitled1=true)
	end object
	Team1Cylinder=Team1CollisionCylinder
	// Reference: CylinderComponent'DBGame.Default__DBPawn.PickupRadiusPredictionCollisionCylinder'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'PickupRadiusPredictionCollisionCylinder'
	begin object name="PickupRadiusPredictionCollisionCylinder" class=Engine.CylinderComponent
		CollisionHeight=200.0000000
		CollisionRadius=200.0000000
		ReplacementPrimitive=none
		CollideActors=true
	end object
	PickupRadiusPredictionCylinder=PickupRadiusPredictionCollisionCylinder
	// Reference: CylinderComponent'DBGame.Default__DBPawn.PickupRadiusCollisionCylinder'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'PickupRadiusCollisionCylinder'
	begin object name="PickupRadiusCollisionCylinder" class=Engine.CylinderComponent
		CollisionHeight=200.0000000
		CollisionRadius=200.0000000
		ReplacementPrimitive=none
		CollideActors=true
	end object
	PickupRadiusCylinder=PickupRadiusCollisionCylinder
	// Reference: DecalComponent'DBGame.Default__DBPawn.BlobShadowComponent'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'BlobShadowComponent'
	begin object name="BlobShadowComponent" class=Engine.DecalComponent
		DecalMaterial=DecalMaterial'DBBall.BlobShadowplayer'
		FarPlane=700.0000000
		bNoClip=true
		bMovableDecal=true
		DecalTransform=EDecalTransform.DecalTransform_OwnerRelative
		ParentRelativeOrientation=(Pitch=-16384,Yaw=0,Roll=0)
		ReplacementPrimitive=none
	end object
	shadowDecal=BlobShadowComponent
	// Reference: DBAnimatedParam'DBGame.Default__DBPawn.ballOwnerAnimHitObj'
	begin object name="ballOwnerAnimHitObj" class=DBGame.DBAnimatedParam
		durationFadeIn=0.0300000
		durationHold=0.1700000
		durationFadeOut=0.1000000
	end object
	BallOwnerAnimHit=ballOwnerAnimHitObj
	ballOwnerColor=/* ERROR: System.ArgumentOutOfRangeException */
	ballOwnerColorHealthCritical=/* ERROR: System.ArgumentOutOfRangeException */
	ballOwnerColorHealthLow=/* ERROR: System.ArgumentOutOfRangeException */
	ballOwnerColorHealthHigh=/* ERROR: System.ArgumentOutOfRangeException */
	ballOwnerColorDamage=/* ERROR: System.ArgumentOutOfRangeException */
	ballOwnerShieldColorRed=/* ERROR: System.ArgumentOutOfRangeException */
	ballOwnerShieldColorBlue=/* ERROR: System.ArgumentOutOfRangeException */
	ballOwnerAlphaDefault=0.5000000
	ballOwnerAlphaHit=0.5000000
	hatColorRedDiffuse=/* ERROR: System.ArgumentOutOfRangeException */
	hatColorBlueDiffuse=/* ERROR: System.ArgumentOutOfRangeException */
	skinColorRedDiffuse=/* ERROR: System.ArgumentOutOfRangeException */
	skinColorBlueDiffuse=/* ERROR: System.ArgumentOutOfRangeException */
	// Reference: DBAnimatedParam'DBGame.Default__DBPawn.eyeAnimAngryObj'
	begin object name="eyeAnimAngryObj" class=DBGame.DBAnimatedParam
		durationFadeIn=0.5000000
		durationHold=5.0000000
		durationFadeOut=10.0000000
	end object
	eyeAnimAngry=eyeAnimAngryObj
	// Reference: DBAnimatedParam'DBGame.Default__DBPawn.eyeAnimBlinkObj'
	begin object name="eyeAnimBlinkObj" class=DBGame.DBAnimatedParam
		durationFadeIn=0.0700000
		durationFadeOut=0.0700000
	end object
	eyeAnimBlink=eyeAnimBlinkObj
	// Reference: DBAnimatedParam'DBGame.Default__DBPawn.eyeAnimKnockoutObj'
	begin object name="eyeAnimKnockoutObj" class=DBGame.DBAnimatedParam
		durationFadeIn=0.5000000
		durationFadeOut=0.5000000
	end object
	eyeAnimKnockout=eyeAnimKnockoutObj
	eyeValueOpen=0.6000000
	eyeValueClosed=-0.0500000
	eyeValueAngry=0.2000000
	blinkTimeMin=0.1000000
	blinkTimeMax=7.0000000
	// Reference: AudioComponent'DBGame.Default__DBPawn.BallSnd'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'BallSnd'
	begin object name="BallSnd" class=Engine.AudioComponent
		SoundCue=SoundCue'DB.Sounds.Carry'
		bStopWhenOwnerDestroyed=true
		bAllowSpatialization=false
	end object
	BallSound=BallSnd
	controlledDeflectSound=SoundCue'DB.Sounds.Deflect'
	behindDeflectSound=SoundCue'DB.Sounds.Deflect2'
	catchSound=SoundCue'DB.Sounds.catch'
	damageSound=SoundCue'DB.Sounds.Damage_Cue'
	lockOnSound=SoundCue'DB.Sounds.Lockmeon_Cue'
	lockOffSound=SoundCue'DB.Sounds.Lockmeoff_Cue'
	multiJumpSound=SoundCue'DB.Sounds.MultiJump'
	DodgeSound=SoundCue'DB.Sounds.Dash'
	kickedVoice=SoundCue'DBVoice01.Kick'
	hurtVoice=SoundCue'DBVoice01.Hurt'
	knockedoutVoice=SoundCue'DBVoice01.KO'
	JumpVoice=SoundCue'DBVoice01.Jump'
	landingVoice=SoundCue'DBVoice01.Land'
	dodgeReadySound=SoundCue'DB.Sounds.DashReady'
	strongCheerVoice=SoundCue'DBVoice01.Morejoy'
	cheerVoice=SoundCue'DBVoice01.Joy'
	laughVoice=SoundCue'DBVoice01.Laugh'
	swearVoice=SoundCue'DBVoice01.Damn'
	xpBoostSound=SoundCue'DB.Sounds.XPBoost'
	xpGoalSound=SoundCue'DB.Sounds.XPGoalAssist'
	xpassistSound=SoundCue'DB.Sounds.XPGoalAssist'
	xpInterceptSound=SoundCue'DB.Sounds.XPIntercept'
	xpKnockoutSound=SoundCue'DB.Sounds.XPKO'
	xpChanceSound=SoundCue'DB.Sounds.XPMiss'
	xpPassSound=SoundCue'DB.Sounds.XPPass'
	xpSaveSound=SoundCue'DB.Sounds.XPSave'
	PersonalGoalProgressUp=SoundCue'DB.Sounds.PersonalGoalUp'
	PersonalGoalProgressDown=SoundCue'DB.Sounds.PersonalGoalDown'
	PersonalGoalProgressDone=SoundCue'DB.Sounds.PersonalGoalDone'
	camShakeDuration=2.0000000
	camShakeStrength=2.2000000
	camShakePassDistortion=1.0000000
	TopSpinForce=400
	BackSpinForce=400
	LeftYawSpinForce=400
	RightYawSpinForce=400
	LeftRollSpinForce=400
	RightRollSpinForce=400
	bobStepSize=210.0000000
	// Reference: DynamicLightEnvironmentComponent'DBGame.Default__DBPawn.MyLightEnvironment'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'MyLightEnvironment'
	// Archetype: DynamicLightEnvironmentComponent'UTGame.Default__UTPawn.MyLightEnvironment'
	begin object name="MyLightEnvironment"
	end object
	LightEnvironment=MyLightEnvironment
	DodgeSpeed=1050.0000000
	DodgeSpeedZ=190.0000000
	// Reference: ForceFeedbackWaveform'DBGame.Default__DBPawn.ForceFeedbackWaveformFall'
	// Archetype: ForceFeedbackWaveform'UTGame.Default__UTPawn.ForceFeedbackWaveformFall'
	begin object name="ForceFeedbackWaveformFall"
	end object
	FallingDamageWaveForm=ForceFeedbackWaveformFall
	MultiJumpRemaining=4
	MaxMultiJump=4
	// Reference: UTAmbientSoundComponent'DBGame.Default__DBPawn.AmbientSoundComponent'
	// Archetype: UTAmbientSoundComponent'UTGame.Default__UTPawn.AmbientSoundComponent'
	begin object name="AmbientSoundComponent"
	end object
	PawnAmbientSound=AmbientSoundComponent
	// Reference: UTAmbientSoundComponent'DBGame.Default__DBPawn.AmbientSoundComponent2'
	// Archetype: UTAmbientSoundComponent'UTGame.Default__UTPawn.AmbientSoundComponent2'
	begin object name="AmbientSoundComponent2"
	end object
	WeaponAmbientSound=AmbientSoundComponent2
	// Reference: SkeletalMeshComponent'DBGame.Default__DBPawn.OverlayMeshComponent0'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'OverlayMeshComponent0'
	// Archetype: SkeletalMeshComponent'UTGame.Default__UTPawn.OverlayMeshComponent0'
	begin object name="OverlayMeshComponent0"
		ReplacementPrimitive=none
	end object
	OverlayMesh=OverlayMeshComponent0
	// Refer[0]ence: UDKSkeletalMeshComponent'DBGame.Default__DBPawn.FirstPersonArms'
	// Archetype: UDKSkeletalMeshComponent'UTGame.Default__UTPawn.FirstPersonArms'
	begin object name="FirstPersonArms"
		// Reference: AnimNodeSequence'DBGame.Default__DBPawn.FirstPersonArms.MeshSequenceA'
		// Archetype: AnimNodeSequence'UTGame.Default__UTPawn.MeshSequenceA'
		begin object name="MeshSequenceA"
		end object
		Animations=MeshSequenceA
		ReplacementPrimitive=none
	end object
	ArmsMesh=FirstPersonArms
	// Reference: UDKSkeletalMeshComponent'DBGame.Default__DBPawn.FirstPersonArms2'
	// Archetype: UDKSkeletalMeshComponent'UTGame.Default__UTPawn.FirstPersonArms2'
	begin object name="FirstPersonArms2"
		// Reference: AnimNodeSequence'DBGame.Default__DBPawn.FirstPersonArms2.MeshSequenceB'
		// Archetype: AnimNodeSequence'UTGame.Default__UTPawn.MeshSequenceB'
		begin object name="MeshSequenceB"
		end object
		Animations=MeshSequenceB
		ReplacementPrimitive=none
	end object
	ArmsMesh=FirstPersonArms2
	bScriptTickSpecial=true
	bReplicateHealthToAll=true
	GroundSpeed=655.0000000
	AirControl=0.3100000
	Health=100000
	ControllerClass=Class'DBGame.DBBot'
	// Reference: SkeletalMeshComponent'DBGame.Default__DBPawn.WPawnSkeletalMeshComponent'
	// TemplateOwnerClass: none
	// TemplateOwnerName: 'WPawnSkeletalMeshComponent'
	// Archetype: SkeletalMeshComponent'UTGame.Default__UTPawn.WPawnSkeletalMeshComponent'
	begin object name="WPawnSkeletalMeshComponent"
		MinDistFactorForKinematicUpdate=0.0000000
		ReplacementPrimitive=none
		LightEnvironment=DynamicLightEnvironmentComponent'DBGame.Default__DBPawn.MyLightEnvironment'
	end object
	Mesh=WPawnSkeletalMeshComponent
	CylinderComponent=CollisionCylinder
	Components=/* Array type was not detected. */
	bAlwaysRelevant=true
	CollisionComponent=CollisionCylinder
}
UELib.DeserializationException: PropertyTag value deserialization error for 'pointerArrowColor
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
PropertyTag value size error for '.pointerArrowColor: Expected: 12, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'pointerArrowColor
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
PropertyTag value size error for '.pointerArrowColor: Expected: 12, Actual: 16
UELib.DeserializationException: PropertyTag value deserialization error for 'dodgeColors
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
PropertyTag value size error for '.dodgeColors: Expected: 12, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'dodgeColors
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
PropertyTag value size error for '.dodgeColors: Expected: 12, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'dodgeColorsKeeper
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
PropertyTag value size error for '.dodgeColorsKeeper: Expected: 12, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'dodgeColorsKeeper
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
PropertyTag value size error for '.dodgeColorsKeeper: Expected: 12, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'Rotation
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
PropertyTag value size error for '.Rotation: Expected: 12, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'Translation
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
PropertyTag value size error for '.Translation: Expected: 12, Actual: 16
UELib.DeserializationException: PropertyTag value deserialization error for 'Rotation
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
PropertyTag value size error for '.Rotation: Expected: 12, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'Translation
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
PropertyTag value size error for '.Translation: Expected: 12, Actual: 16
Trailing data for object StaticMeshComponent'DBGame.Default__DBPawn.BallownerMeshComp'
Trailing data for object StaticMeshComponent'DBGame.Default__DBPawn.BallownerMeshComp'
Trailing data for object StaticMeshComponent'DBGame.Default__DBPawn.HatMeshComp'
Trailing data for object StaticMeshComponent'DBGame.Default__DBPawn.HatMeshComp'
Trailing data for object DecalComponent'DBGame.Default__DBPawn.BlobShadowComponent'
Trailing data for object DecalComponent'DBGame.Default__DBPawn.BlobShadowComponent'
UELib.DeserializationException: PropertyTag value deserialization error for 'ballOwnerColor
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
PropertyTag value size error for '.ballOwnerColor: Expected: 16, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'ballOwnerColorHealthCritical
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
PropertyTag value size error for '.ballOwnerColorHealthCritical: Expected: 16, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'ballOwnerColorHealthLow
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
PropertyTag value size error for '.ballOwnerColorHealthLow: Expected: 16, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'ballOwnerColorHealthHigh
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
PropertyTag value size error for '.ballOwnerColorHealthHigh: Expected: 16, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'ballOwnerColorDamage
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
PropertyTag value size error for '.ballOwnerColorDamage: Expected: 16, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'ballOwnerShieldColorRed
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
PropertyTag value size error for '.ballOwnerShieldColorRed: Expected: 16, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'ballOwnerShieldColorBlue
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
UELib.DeserializationException: PropertyTag value deserialization error for 'hatColorRedDiffuse
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
PropertyTag value size error for '.hatColorRedDiffuse: Expected: 16, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'hatColorBlueDiffuse
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
UELib.DeserializationException: PropertyTag value deserialization error for 'skinColorRedDiffuse
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
PropertyTag value size error for '.skinColorRedDiffuse: Expected: 16, Actual: 8
UELib.DeserializationException: PropertyTag value deserialization error for 'skinColorBlueDiffuse
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
PropertyTag value size error for '.Components: Expected: 84, Actual: 4
