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

// Run start when lens loads
start();

global.goToEnvironmentScene = goToEnvironmentScene;
