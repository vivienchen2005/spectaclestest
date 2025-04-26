//@input SceneObject interactableObject
//@input SceneObject openingScene
//@input SceneObject environmentOptionsScene

function onPinchButtonPressed() {
    print("✅ PinchButton Pressed!");
    if (script.environmentOptionsScene) {
        script.environmentOptionsScene.enabled = true;
    }
    if (script.openingScene) {
        script.openingScene.enabled = false;
    }
}

var interactable = script.interactableObject.getComponent("Component.ScriptComponent");

if (interactable && interactable.api && interactable.api.onTriggerEnd) {
    interactable.api.onTriggerEnd.add(function() {
        onPinchButtonPressed();
    });
}
