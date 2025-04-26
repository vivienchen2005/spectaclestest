const AnimationStateManager = require('/AnimationStateManagerDeclaration')

// custom type inputs
@typedef
export class AnimationTimestamp {
    @input
    time: number

    @input
    @widget(new ComboBoxWidget(['Idle', 'Amused', 'Angry', 'Confused', 'Crying', 'Curious', 'Happy', 'Laughing', 'Sad', 'Scared'].map(n => new ComboBoxItem(n, n))))

    @label('Animation')
    faceAnimState: string
}

@component
export class BitmojiFaceAnimator extends BaseScriptComponent {

    public static Mode = {
        PlayOne: 0,
        PlayRandom: 1,
        PlaySequence: 2
    } as const

    public static AnimationState = [
        'Idle', 'Amused', 'Angry', 'Confused', 'Crying', 'Curious', 'Happy', 'Laughing', 'Sad', 'Scared'
    ] as const

    @typename
    AnimationStateManagerComponent: keyof ComponentNameMap

    // predefined set of built-in clips
    private animNames: typeof BitmojiFaceAnimator.AnimationState[number][] = [...BitmojiFaceAnimator.AnimationState]

    @input('int')
    @hint('<b>Play One</b> - plays animation of choice. <br><b>Play Random</b> - randomly selects and plays one animation based on probability.<br><b>Play Sequence</b> - plays predefined sequence of animations.<br>')
    @widget(new ComboBoxWidget([new ComboBoxItem('Play One', 0), new ComboBoxItem('Play Random', 1), new ComboBoxItem('Play Sequence', 2)]))
    mode: number = 0

    @input
    @label("Idle Animation")
    @widget(new ComboBoxWidget(['Idle', 'Amused', 'Angry', 'Confused', 'Crying', 'Curious', 'Happy', 'Laughing', 'Sad', 'Scared'].map(n => new ComboBoxItem(n, n))))
    defaultAnimation: string = "Idle"

    @input('bool')
    @label("Return To Idle")
    @hint("Enter every state, play animation once and return to idle automatically. If disabled - once entered a non-idle state it will loop until the further change of state.")
    alwaysReturnToIdle: boolean = true

    @input
    @label("Transition Duration")
    @hint("Default transition duration, you may override this in setState function's argument")
    defaultTransitionLength: number = 0.4


    @ui.separator
    private animationController: typeof AnimationStateManager
    private animationPlayer: AnimationPlayer


    @input @showIf('mode', 1) minMaxTime: vec2 = new vec2(4, 6)

    @input @showIf('mode', 2) @hint("Duration of sequence. Make sure it is longer that your largest timestamp!") @widget(new SpinBoxWidget(0, 1000, 0.1))
    duration: number = 10

    @input @showIf('mode', 2) @hint("Play sequence in a loop")
    loopSequence: boolean = true

    @input @showIf('mode', 2)
    timestamps: AnimationTimestamp[]

    private currentTime: number = 0
    private sequenceIndex: number = 0



    // Animation occurrence probabilities when using Random Animation mode
    @ui.group_start('Occurrence Weights') @showIf('mode', 1) @hint("The higher the value, the more likely this animation is to be randomly selected. If the weight is 0, the animation will not occur.")

    @input @label('Amused') @widget(new SliderWidget(0, 10, 1)) probAmused: number = 1
    @input @label('Angry') @widget(new SliderWidget(0, 10, 1)) probAngry: number = 0
    @input @label('Confused') @widget(new SliderWidget(0, 10, 1)) probConfused: number = 1
    @input @label('Crying') @widget(new SliderWidget(0, 10, 1)) probCrying: number = 1
    @input @label('Curious') @widget(new SliderWidget(0, 10, 1)) probCurious: number = 1
    @input @label('Happy') @widget(new SliderWidget(0, 10, 1)) probHappy: number = 1
    @input @label('Idle') @widget(new SliderWidget(0, 10, 1)) probIdle: number = 1
    @input @label('Laughing') @widget(new SliderWidget(0, 10, 1)) probLaughing: number = 1
    @input @label('Sad') @widget(new SliderWidget(0, 10, 1)) probSad: number = 0
    @input @label('Scared') @widget(new SliderWidget(0, 10, 1)) probScared: number = 0
    @ui.group_end

    // Hidden inputs for built in animation assets
    @input @label('Amused') animationAmused: AnimationAsset
    @input @label('Angry') animationAngry: AnimationAsset
    @input @label('Confused') animationConfused: AnimationAsset
    @input @label('Crying') animationCrying: AnimationAsset
    @input @label('Curious') animationCurious: AnimationAsset
    @input @label('Happy') animationHappy: AnimationAsset
    @input @label('Idle') animationIdle: AnimationAsset
    @input @label('Laughing') animationLaughing: AnimationAsset
    @input @label('Sad') animationSad: AnimationAsset
    @input @label('Scared') animationScared: AnimationAsset
    @ui.separator

    @input
    debug: boolean = false

    @input
    @allowUndefined
    @showIf('debug', true)
    textComponent: Text

    onAwake() {
        // lifecycle event callbacks
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this))
        this.createEvent("OnEnableEvent").bind(this.onEnable.bind(this))
        this.createEvent("OnDisableEvent").bind(this.onDisable.bind(this))
        this.createEvent("OnDestroyEvent").bind(this.onDestroy.bind(this))
    }

    onStart() {
        // create animation player and add all clips
        this.createAnimationPlayer()
        // add animation state manager to handle animation states and all the blending
        this.createAnimationController()
        // create automatic transitions from clips to default animation (set through input) 
        if (this.alwaysReturnToIdle) {
            this.createAnimationTransitions()
        }

        this.addApiFunctions();

        this.animationController.setState(this.defaultAnimation, 0); //set initial state immediately

        switch (this.mode) {
            case BitmojiFaceAnimator.Mode.PlayRandom:
                // play random animation and always go back to idle once finished
                this.currentTime = this.getRandomTime();
                this.createEvent('UpdateEvent').bind(this.playRandomAnimation.bind(this))
                break
            case BitmojiFaceAnimator.Mode.PlaySequence:
                if (this.timestamps.length == 0) {
                    print('No timestamps provided')
                    break
                }
                this.timestamps.sort((a, b) => a.time - b.time)
                this.createEvent('UpdateEvent').bind(this.playAnimationsOnTime.bind(this))
                break
        }
    }

    createAnimationPlayer() {
        // add clean if already exists
        const player = this.sceneObject.createComponent('AnimationPlayer')

        for (let i = 0; i < this.animNames.length; i++) {
            let animation = this['animation' + this.animNames[i]]
            if (!isNull(animation)) {
                //    
                this.applyAnimationMask(animation);
                let clip = AnimationClip.createFromAnimation(
                    this.animNames[i],
                    animation
                )
                clip.begin = 0
                clip.end = animation.duration
                clip.weight = 0

                player.addClip(clip)
            } else {
                print('Warning: Animation' + this.animNames[i] + ' wasn\'t set')
            }
        }

        this.animationPlayer = player;
    }
   private jointMask: string[] = [
        'rig_GRP',
        'bind_GRP',
        'Hips_SSC_Mixamo',
        'Hips',
        'Spine',
        'C_stomach_bind_JNT',
        'C_spine0002_bind_JNT_SSC',
        'C_spine0002_bind_JNT',
        'C_spine0003_bind_JNT_SSC',
        'Spine1',
        'C_neck0001_bind_JNT_SSC',
        'Neck',
        'C_neck0002_bind_JNT_SSC',
        'C_neck0002_bind_JNT',
        'C_head_bind_JNT_SSC',
        'Head',
        'R_clavicle_bind_JNT_SSC',
        'RightShoulder',
        'R_armUpper0001_bind_JNT_SSC',
        'RightArm',
        'R_armLower0001_bind_JNT_SSC',
        'RightForeArm',
        'R_hand0001_bind_JNT_SSC',
        'RightHand',
        'R_handMiddle0001_bind_JNT',
        'R_handMiddle0002_bind_JNT_SSC',
        'R_handMiddle0002_bind_JNT',
        'R_handMiddle0003_bind_JNT_SSC',
        'R_handMiddle0003_bind_JNT',
        'R_handMiddle0004_bind_JNT_SSC',
        'R_handMiddle0004_bind_JNT',
        'R_handPinky0001_bind_JNT',
        'R_handPinky0002_bind_JNT_SSC',
        'R_handPinky0002_bind_JNT',
        'R_handPinky0003_bind_JNT_SSC',
        'R_handPinky0003_bind_JNT',
        'R_handPinky0004_bind_JNT_SSC',
        'R_handPinky0004_bind_JNT',
        'R_handPointer0001_bind_JNT',
        'R_handPointer0002_bind_JNT_SSC',
        'R_handPointer0002_bind_JNT',
        'R_handPointer0003_bind_JNT_SSC',
        'R_handPointer0003_bind_JNT',
        'R_handPointer0004_bind_JNT_SSC',
        'R_handPointer0004_bind_JNT',
        'R_handRing0001_bind_JNT',
        'R_handRing0002_bind_JNT_SSC',
        'R_handRing0002_bind_JNT',
        'R_handRing0003_bind_JNT_SSC',
        'R_handRing0003_bind_JNT',
        'R_handRing0004_bind_JNT_SSC',
        'R_handRing0004_bind_JNT',
        'R_handThumb0001_bind_JNT',
        'R_handThumb0002_bind_JNT_SSC',
        'R_handThumb0002_bind_JNT',
        'R_handThumb0003_bind_JNT_SSC',
        'R_handThumb0003_bind_JNT',
        'R_armLower0002_bind_JNT_SSC',
        'R_armLower0002_bind_JNT',
        'R_armUpper0002_bind_JNT_SSC',
        'R_armUpper0002_bind_JNT',
        'L_clavicle_bind_JNT_SSC',
        'LeftShoulder',
        'L_armUpper0001_bind_JNT_SSC',
        'LeftArm',
        'L_armLower0001_bind_JNT_SSC',
        'LeftForeArm',
        'L_hand0001_bind_JNT_SSC',
        'LeftHand',
        'L_handMiddle0001_bind_JNT',
        'L_handMiddle0002_bind_JNT_SSC',
        'L_handMiddle0002_bind_JNT',
        'L_handMiddle0003_bind_JNT_SSC',
        'L_handMiddle0003_bind_JNT',
        'L_handMiddle0004_bind_JNT_SSC',
        'L_handMiddle0004_bind_JNT',
        'L_handPinky0001_bind_JNT',
        'L_handPinky0002_bind_JNT_SSC',
        'L_handPinky0002_bind_JNT',
        'L_handPinky0003_bind_JNT_SSC',
        'L_handPinky0003_bind_JNT',
        'L_handPinky0004_bind_JNT_SSC',
        'L_handPinky0004_bind_JNT',
        'L_handPointer0001_bind_JNT',
        'L_handPointer0002_bind_JNT_SSC',
        'L_handPointer0002_bind_JNT',
        'L_handPointer0003_bind_JNT_SSC',
        'L_handPointer0003_bind_JNT',
        'L_handPointer0004_bind_JNT_SSC',
        'L_handPointer0004_bind_JNT',
        'L_handRing0001_bind_JNT',
        'L_handRing0002_bind_JNT_SSC',
        'L_handRing0002_bind_JNT',
        'L_handRing0003_bind_JNT_SSC',
        'L_handRing0003_bind_JNT',
        'L_handRing0004_bind_JNT_SSC',
        'L_handRing0004_bind_JNT',
        'L_handThumb0001_bind_JNT',
        'L_handThumb0002_bind_JNT_SSC',
        'L_handThumb0002_bind_JNT',
        'L_handThumb0003_bind_JNT_SSC',
        'L_handThumb0003_bind_JNT',
        'L_armLower0002_bind_JNT_SSC',
        'L_armLower0002_bind_JNT',
        'L_armUpper0002_bind_JNT_SSC',
        'L_armUpper0002_bind_JNT',
        'R_chest_bind_JNT_SSC',
        'R_chest_bind_JNT',
        'L_chest_bind_JNT_SSC',
        'L_chest_bind_JNT',
        'C_pelvis0001_bind_JNT',
        'L_legUpper0001_bind_JNT_SSC',
        'LeftUpLeg',
        'L_legLower0001_bind_JNT_SSC',
        'LeftLeg',
        'L_foot0001_bind_JNT_SSC',
        'LeftFoot',
        'L_foot0002_bind_JNT_SSC',
        'LeftToeBase',
        'L_legLower0002_bind_JNT_SSC',
        'L_legLower0002_bind_JNT',
        'L_legUpper0002_bind_JNT_SSC',
        'L_legUpper0002_bind_JNT',
        'R_legUpper0001_bind_JNT_SSC',
        'RightUpLeg',
        'R_legLower0001_bind_JNT_SSC',
        'RightLeg',
        'R_foot0001_bind_JNT_SSC',
        'RightFoot',
        'R_foot0002_bind_JNT_SSC',
        'RightToeBase',
        'R_legLower0002_bind_JNT_SSC',
        'R_legLower0002_bind_JNT',
        'R_legUpper0002_bind_JNT_SSC',
        'R_legUpper0002_bind_JNT',
        'L_legFront_bind_JNT_SSC',
        'L_legFront_bind_JNT',
        'R_legFront_bind_JNT_SSC',
        'R_legFront_bind_JNT',
        'R_legRear_bind_JNT_SSC',
        'R_legRear_bind_JNT',
        'L_legRear_bind_JNT_SSC',
        'L_legRear_bind_JNT',
    ]

    applyAnimationMask(animation: AnimationAsset) {
        for (let i in this.jointMask) {
            animation.deleteLayer(this.jointMask[i])
        }
    }

    createAnimationController() {
        // create animation state manager to handle states and all the transitions
        this.animationController = this.sceneObject.createComponent(this.AnimationStateManagerComponent) as typeof AnimationStateManager
        this.animationController.createStatesFromClips = true

        // add debug
        if (this.debug) {
            this.animationController.showDebug = true
            this.animationController.debugText = this.textComponent
            this.animationController.displayStates = true
        }

        this.animationController.init(this.animationPlayer)
    }

    private createAnimationTransitions() {
        let backToIdle = {
            enabled: true,
            fromStateType: this.animationController.StateType.Any,
            toStateType: this.animationController.StateType.Specific,
            toStateName: this.defaultAnimation,
            duration: this.defaultTransitionLength,
            hasExitTime: true,
            exitTime: 0.9, // all clips are ~ 4 sec long, this will start transitioning at 3.6 over 0.4 sec
            conditions: []
        }
        this.animationController.addTransitionFromConfig(backToIdle)
    }

    private playRandomAnimation() {
        this.currentTime -= getDeltaTime()

        if (this.currentTime <= 0) {
            const weights = this.animNames.map((animName) => {
                const weight = this['prob' + animName]
                return weight ?? 1
            });
            const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

            // Generate a random number between 0 and totalWeight
            const randomNum = Math.random() * totalWeight

            // // Select clip based on the random number and cumulative weights
            let cumulativeWeight = 0;
            let selectedIndex = 0;

            for (let i = 0; i < weights.length; i++) {
                cumulativeWeight += weights[i];
                if (randomNum < cumulativeWeight) {
                    selectedIndex = i;
                    break
                }
            }

            this.currentTime = this.getRandomTime();
            this.animationController.setState(this.animNames[selectedIndex], this.defaultTransitionLength);
        }
    }
    // function creates public functions for easy use - setStateAngry and etc..
    private addApiFunctions() {
        let self = this;
        this.animNames.forEach(animName => {
            this["setState" + animName] = (transitionDuration: number = self.defaultTransitionLength) => {
                self.setState(animName, transitionDuration)
            }
        })
    }

    private playAnimationsOnTime() {
        if (this.sequenceIndex < this.timestamps.length && this.currentTime >= this.timestamps[this.sequenceIndex].time) {
            if (this.debug) {
                print(`Playing ${this.timestamps[this.sequenceIndex].faceAnimState} at ${this.timestamps[this.sequenceIndex].time} sec`)
            }
            let stateName = this.timestamps[this.sequenceIndex].faceAnimState
            this.setState(stateName, this.defaultTransitionLength)
            this.sequenceIndex += 1
        }

        this.currentTime += getDeltaTime()
        if (this.currentTime >= this.duration && this.loopSequence) {
            this.currentTime = this.currentTime % this.duration
            this.sequenceIndex = 0
        }
    }

    private getRandomTime() {
        return this.minMaxTime.x + Math.random() * (this.minMaxTime.y - this.minMaxTime.x)
    }


    // public api
    public setState(stateName: string, transitionDuration: number): void {
        if (!this.animNames.includes(stateName as typeof BitmojiFaceAnimator.AnimationState[number])) {
            print(`Warning: State ${stateName} is not defined`);
        }
        this.animationController.setState(stateName, transitionDuration);
    }

    public getState(): string {
        return this.animationController.getCurrentStateName()
    }

    public restartSequence() {
        if (this.mode == BitmojiFaceAnimator.Mode.PlaySequence) {
            this.currentTime = 0
            this.sequenceIndex = 0
        }
    }

    // lifecycle events
    onDestroy() {
        if (!isNull(this.animationController)) {
            this.animationController.destroy()
        }
        if (!isNull(this.animationPlayer)) {
            this.animationPlayer.destroy()
        }
    }

    onEnable() {
        this.setUnderlyingComponentsEnabled(true)
    }

    onDisable() {
        this.setUnderlyingComponentsEnabled(false)
    }

    setUnderlyingComponentsEnabled(v: boolean) {
        if (!isNull(this.animationController)) {
            this.animationController.enabled = v
        }
        if (!isNull(this.animationPlayer)) {
            this.animationPlayer.enabled = v
        }
    }
}


