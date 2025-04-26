//@input SceneObject openingScene
//@input SceneObject environmentOptionsScene

// Hide all scenes
function hideAllScenes() {
    script.openingScene.enabled = false;
    script.environmentOptionsScene.enabled = false;
}

// Start at opening scene
function start() {
    hideAllScenes();
    script.openingScene.enabled = true;
}

// User wants to go to Grocery Scene
function goToEnvironmentScene() {
    print("pressed");
    hideAllScenes();
    script.environmentOptionsScene.enabled = true;
}

function testButtonPress() {
    print("✅ TEST BUTTON PRESSED!");
}
print("hi");

// Run start when lens loads
start();
global.testButtonPress = testButtonPress;


global.goToEnvironmentScene = goToEnvironmentScene;
