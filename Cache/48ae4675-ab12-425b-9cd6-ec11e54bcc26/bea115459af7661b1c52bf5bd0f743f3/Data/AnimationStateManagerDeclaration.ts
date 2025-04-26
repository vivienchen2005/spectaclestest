// AnimationStateManager.d.ts
// Version 1.0.3 for 
// TypeScript declaration file for AnimationStateManager.js


// Main script object and its methods
export interface AnimationStateManager extends ScriptComponent {

    addParameter(name: string, defaultValue: boolean | number): void;
    setParameter(name: string, value: boolean | number): void;
    setTrigger(name: string): void;
    resetTrigger(name: string): void;
    getState(name: string): AnimationState;
    setState(newState: string, transitionDuration: number): void;
    addTransitionFromConfig(stateTransition: StateTransitionConfig): void;
    addStateFromConfig(s: AnimationState): void;
    getCurrentStateName(): string | undefined;
    init(animationPlayer: AnimationPlayer): void;

    animationPlayer: AnimationPlayer;
    createStatesFromClips: boolean

    stateMachine: any;
    StateSource: { SingleClip: number; BlendTree: number };
    ConditionFunction: string
    StateType: { Entry: number; Specific: number; Any: number; Exit: number };
    ParameterType: { Trigger: string; Int: string; Float: string; Bool: string };

    debugText: Text;
    showDebug: boolean;
    displayStates: boolean;
    displayParameters: boolean;
}
// Represents a pair of clip and threshold
interface ClipWeightPair {
    clipName: string;
    threshold: number;
}

// Represents animation state
interface AnimationState {
    stateName: string;
    source: number; // 0 for Single Clip, 1 for Blend Tree
    clipName?: string;
    blendTreeClips?: ClipWeightPair[];
    normalizeClipDuration?: boolean;
    blendParameterName?: string;
}

// Represents animation parameter
interface AnimationParameter {
    paramName: string;
    type: string;
    valueInt?: number;
    valueFloat?: number;
    valueBool?: boolean;
    valueTrigger?: boolean;
}

// Represents a condition for an animation parameter
interface AnimationParameterCondition {
    paramName: string;
    type: string;
    funcInt?: string;
    funcFloat?: string;
    funcBool?: string;
    valueInt?: number;
    valueFloat?: number;
}

// Represents a state transition
interface StateTransitionConfig {
    enabled: boolean;
    fromStateType: number;
    fromStateName?: string;
    toStateType: number;
    toStateName?: string;
    duration: number;
    hasExitTime: boolean;
    exitTime?: number;
    conditions?: AnimationParameterCondition[];
}

