"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BitmojiFaceAnimator_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitmojiFaceAnimator = exports.AnimationTimestamp = void 0;
var __selfType = requireType("./BitmojiFaceAnimator");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const AnimationStateManager = require('/AnimationStateManagerDeclaration');
// custom type inputs
class AnimationTimestamp {
}
exports.AnimationTimestamp = AnimationTimestamp;
let BitmojiFaceAnimator = BitmojiFaceAnimator_1 = class BitmojiFaceAnimator extends BaseScriptComponent {
    onAwake() {
        // lifecycle event callbacks
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
        this.createEvent("OnEnableEvent").bind(this.onEnable.bind(this));
        this.createEvent("OnDisableEvent").bind(this.onDisable.bind(this));
        this.createEvent("OnDestroyEvent").bind(this.onDestroy.bind(this));
    }
    onStart() {
        // create animation player and add all clips
        this.createAnimationPlayer();
        // add animation state manager to handle animation states and all the blending
        this.createAnimationController();
        // create automatic transitions from clips to default animation (set through input) 
        if (this.alwaysReturnToIdle) {
            this.createAnimationTransitions();
        }
        this.addApiFunctions();
        this.animationController.setState(this.defaultAnimation, 0); //set initial state immediately
        switch (this.mode) {
            case BitmojiFaceAnimator_1.Mode.PlayRandom:
                // play random animation and always go back to idle once finished
                this.currentTime = this.getRandomTime();
                this.createEvent('UpdateEvent').bind(this.playRandomAnimation.bind(this));
                break;
            case BitmojiFaceAnimator_1.Mode.PlaySequence:
                if (this.timestamps.length == 0) {
                    print('No timestamps provided');
                    break;
                }
                this.timestamps.sort((a, b) => a.time - b.time);
                this.createEvent('UpdateEvent').bind(this.playAnimationsOnTime.bind(this));
                break;
        }
    }
    createAnimationPlayer() {
        // add clean if already exists
        const player = this.sceneObject.createComponent('AnimationPlayer');
        for (let i = 0; i < this.animNames.length; i++) {
            let animation = this['animation' + this.animNames[i]];
            if (!isNull(animation)) {
                //    
                this.applyAnimationMask(animation);
                let clip = AnimationClip.createFromAnimation(this.animNames[i], animation);
                clip.begin = 0;
                clip.end = animation.duration;
                clip.weight = 0;
                player.addClip(clip);
            }
            else {
                print('Warning: Animation' + this.animNames[i] + ' wasn\'t set');
            }
        }
        this.animationPlayer = player;
    }
    applyAnimationMask(animation) {
        for (let i in this.jointMask) {
            animation.deleteLayer(this.jointMask[i]);
        }
    }
    createAnimationController() {
        // create animation state manager to handle states and all the transitions
        this.animationController = this.sceneObject.createComponent(this.AnimationStateManagerComponent);
        this.animationController.createStatesFromClips = true;
        // add debug
        if (this.debug) {
            this.animationController.showDebug = true;
            this.animationController.debugText = this.textComponent;
            this.animationController.displayStates = true;
        }
        this.animationController.init(this.animationPlayer);
    }
    createAnimationTransitions() {
        let backToIdle = {
            enabled: true,
            fromStateType: this.animationController.StateType.Any,
            toStateType: this.animationController.StateType.Specific,
            toStateName: this.defaultAnimation,
            duration: this.defaultTransitionLength,
            hasExitTime: true,
            exitTime: 0.9, // all clips are ~ 4 sec long, this will start transitioning at 3.6 over 0.4 sec
            conditions: []
        };
        this.animationController.addTransitionFromConfig(backToIdle);
    }
    playRandomAnimation() {
        this.currentTime -= getDeltaTime();
        if (this.currentTime <= 0) {
            const weights = this.animNames.map((animName) => {
                const weight = this['prob' + animName];
                return weight !== null && weight !== void 0 ? weight : 1;
            });
            const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
            // Generate a random number between 0 and totalWeight
            const randomNum = Math.random() * totalWeight;
            // // Select clip based on the random number and cumulative weights
            let cumulativeWeight = 0;
            let selectedIndex = 0;
            for (let i = 0; i < weights.length; i++) {
                cumulativeWeight += weights[i];
                if (randomNum < cumulativeWeight) {
                    selectedIndex = i;
                    break;
                }
            }
            this.currentTime = this.getRandomTime();
            this.animationController.setState(this.animNames[selectedIndex], this.defaultTransitionLength);
        }
    }
    // function creates public functions for easy use - setStateAngry and etc..
    addApiFunctions() {
        let self = this;
        this.animNames.forEach(animName => {
            this["setState" + animName] = (transitionDuration = self.defaultTransitionLength) => {
                self.setState(animName, transitionDuration);
            };
        });
    }
    playAnimationsOnTime() {
        if (this.sequenceIndex < this.timestamps.length && this.currentTime >= this.timestamps[this.sequenceIndex].time) {
            if (this.debug) {
                print(`Playing ${this.timestamps[this.sequenceIndex].faceAnimState} at ${this.timestamps[this.sequenceIndex].time} sec`);
            }
            let stateName = this.timestamps[this.sequenceIndex].faceAnimState;
            this.setState(stateName, this.defaultTransitionLength);
            this.sequenceIndex += 1;
        }
        this.currentTime += getDeltaTime();
        if (this.currentTime >= this.duration && this.loopSequence) {
            this.currentTime = this.currentTime % this.duration;
            this.sequenceIndex = 0;
        }
    }
    getRandomTime() {
        return this.minMaxTime.x + Math.random() * (this.minMaxTime.y - this.minMaxTime.x);
    }
    // public api
    setState(stateName, transitionDuration) {
        if (!this.animNames.includes(stateName)) {
            print(`Warning: State ${stateName} is not defined`);
        }
        this.animationController.setState(stateName, transitionDuration);
    }
    getState() {
        return this.animationController.getCurrentStateName();
    }
    restartSequence() {
        if (this.mode == BitmojiFaceAnimator_1.Mode.PlaySequence) {
            this.currentTime = 0;
            this.sequenceIndex = 0;
        }
    }
    // lifecycle events
    onDestroy() {
        if (!isNull(this.animationController)) {
            this.animationController.destroy();
        }
        if (!isNull(this.animationPlayer)) {
            this.animationPlayer.destroy();
        }
    }
    onEnable() {
        this.setUnderlyingComponentsEnabled(true);
    }
    onDisable() {
        this.setUnderlyingComponentsEnabled(false);
    }
    setUnderlyingComponentsEnabled(v) {
        if (!isNull(this.animationController)) {
            this.animationController.enabled = v;
        }
        if (!isNull(this.animationPlayer)) {
            this.animationPlayer.enabled = v;
        }
    }
    __initialize() {
        super.__initialize();
        this.animNames = [...BitmojiFaceAnimator_1.AnimationState];
        this.currentTime = 0;
        this.sequenceIndex = 0;
        this.jointMask = [
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
        ];
    }
};
exports.BitmojiFaceAnimator = BitmojiFaceAnimator;
BitmojiFaceAnimator.Mode = {
    PlayOne: 0,
    PlayRandom: 1,
    PlaySequence: 2
};
BitmojiFaceAnimator.AnimationState = [
    'Idle', 'Amused', 'Angry', 'Confused', 'Crying', 'Curious', 'Happy', 'Laughing', 'Sad', 'Scared'
];
exports.BitmojiFaceAnimator = BitmojiFaceAnimator = BitmojiFaceAnimator_1 = __decorate([
    component
], BitmojiFaceAnimator);
//# sourceMappingURL=BitmojiFaceAnimator.js.map