if (script.onAwake) {
	script.onAwake();
	return;
};
/*
@typedef AnimationTimestamp
@property {float} time 
@property {string} faceAnimState {"label":"Animation", "widget":"combobox", "values":[{"label":"Idle", "value":"Idle"}, {"label":"Amused", "value":"Amused"}, {"label":"Angry", "value":"Angry"}, {"label":"Confused", "value":"Confused"}, {"label":"Crying", "value":"Crying"}, {"label":"Curious", "value":"Curious"}, {"label":"Happy", "value":"Happy"}, {"label":"Laughing", "value":"Laughing"}, {"label":"Sad", "value":"Sad"}, {"label":"Scared", "value":"Scared"}]}
*/
function checkUndefined(property, showIfData){
   for (var i = 0; i < showIfData.length; i++){
       if (showIfData[i][0] && script[showIfData[i][0]] != showIfData[i][1]){
           return;
       }
   }
   if (script[property] == undefined){
      throw new Error('Input ' + property + ' was not provided for the object ' + script.getSceneObject().name);
   }
}
// @typename AnimationStateManagerComponent
// @input int mode {"hint":"<b>Play One</b> - plays animation of choice. <br><b>Play Random</b> - randomly selects and plays one animation based on probability.<br><b>Play Sequence</b> - plays predefined sequence of animations.<br>", "widget":"combobox", "values":[{"label":"Play One", "value":0}, {"label":"Play Random", "value":1}, {"label":"Play Sequence", "value":2}]}
checkUndefined("mode", []);
// @input string defaultAnimation = "Idle" {"label":"Idle Animation", "widget":"combobox", "values":[{"label":"Idle", "value":"Idle"}, {"label":"Amused", "value":"Amused"}, {"label":"Angry", "value":"Angry"}, {"label":"Confused", "value":"Confused"}, {"label":"Crying", "value":"Crying"}, {"label":"Curious", "value":"Curious"}, {"label":"Happy", "value":"Happy"}, {"label":"Laughing", "value":"Laughing"}, {"label":"Sad", "value":"Sad"}, {"label":"Scared", "value":"Scared"}]}
checkUndefined("defaultAnimation", []);
// @input bool alwaysReturnToIdle = true {"label":"Return To Idle", "hint":"Enter every state, play animation once and return to idle automatically. If disabled - once entered a non-idle state it will loop until the further change of state."}
checkUndefined("alwaysReturnToIdle", []);
// @input float defaultTransitionLength = 0.4 {"label":"Transition Duration", "hint":"Default transition duration, you may override this in setState function's argument"}
checkUndefined("defaultTransitionLength", []);
// @ui {"widget":"separator"}
// @input vec2 minMaxTime = {4,6} {"showIf":"mode", "showIfValue":1}
checkUndefined("minMaxTime", [["mode",1]]);
// @input float duration = 10 {"hint":"Duration of sequence. Make sure it is longer that your largest timestamp!", "widget":"spinbox", "min":0, "max":1000, "step":0.1, "showIf":"mode", "showIfValue":2}
checkUndefined("duration", [["mode",2]]);
// @input bool loopSequence = true {"hint":"Play sequence in a loop", "showIf":"mode", "showIfValue":2}
checkUndefined("loopSequence", [["mode",2]]);
// @input AnimationTimestamp[] timestamps {"showIf":"mode", "showIfValue":2}
checkUndefined("timestamps", [["mode",2]]);
// @ui {"hint":"The higher the value, the more likely this animation is to be randomly selected. If the weight is 0, the animation will not occur.", "widget":"group_start", "label":"Occurrence Weights", "showIf":"mode", "showIfValue":1}
// @input float probAmused = 1 {"label":"Amused", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probAmused", [["mode",1]]);
// @input float probAngry {"label":"Angry", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probAngry", [["mode",1]]);
// @input float probConfused = 1 {"label":"Confused", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probConfused", [["mode",1]]);
// @input float probCrying = 1 {"label":"Crying", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probCrying", [["mode",1]]);
// @input float probCurious = 1 {"label":"Curious", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probCurious", [["mode",1]]);
// @input float probHappy = 1 {"label":"Happy", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probHappy", [["mode",1]]);
// @input float probIdle = 1 {"label":"Idle", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probIdle", [["mode",1]]);
// @input float probLaughing = 1 {"label":"Laughing", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probLaughing", [["mode",1]]);
// @input float probSad {"label":"Sad", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probSad", [["mode",1]]);
// @input float probScared {"label":"Scared", "widget":"slider", "min":0, "max":10, "step":1}
checkUndefined("probScared", [["mode",1]]);
// @ui {"widget":"group_end"}
// @input Asset.AnimationAsset animationAmused {"label":"Amused"}
checkUndefined("animationAmused", []);
// @input Asset.AnimationAsset animationAngry {"label":"Angry"}
checkUndefined("animationAngry", []);
// @input Asset.AnimationAsset animationConfused {"label":"Confused"}
checkUndefined("animationConfused", []);
// @input Asset.AnimationAsset animationCrying {"label":"Crying"}
checkUndefined("animationCrying", []);
// @input Asset.AnimationAsset animationCurious {"label":"Curious"}
checkUndefined("animationCurious", []);
// @input Asset.AnimationAsset animationHappy {"label":"Happy"}
checkUndefined("animationHappy", []);
// @input Asset.AnimationAsset animationIdle {"label":"Idle"}
checkUndefined("animationIdle", []);
// @input Asset.AnimationAsset animationLaughing {"label":"Laughing"}
checkUndefined("animationLaughing", []);
// @input Asset.AnimationAsset animationSad {"label":"Sad"}
checkUndefined("animationSad", []);
// @input Asset.AnimationAsset animationScared {"label":"Scared"}
checkUndefined("animationScared", []);
// @ui {"widget":"separator"}
// @input bool debug
checkUndefined("debug", []);
// @input Component.Text textComponent {"showIf":"debug", "showIfValue":true}
var scriptPrototype = Object.getPrototypeOf(script);
if (!global.BaseScriptComponent){
   function BaseScriptComponent(){}
   global.BaseScriptComponent = BaseScriptComponent;
   global.BaseScriptComponent.prototype = scriptPrototype;
   global.BaseScriptComponent.prototype.__initialize = function(){};
   global.BaseScriptComponent.getTypeName = function(){
       throw new Error("Cannot get type name from the class, not decorated with @component");
   }
}
var Module = require("../../../../Modules/Src/Assets/Bitmoji Face Animator.lsc/BitmojiFaceAnimator");
Object.setPrototypeOf(script, Module.BitmojiFaceAnimator.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
