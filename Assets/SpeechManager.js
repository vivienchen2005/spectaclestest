//@input SceneObject textBubble
//@input SceneObject nextButton

var lines = [
    "Hi there!",
    "Welcome to the park!",
    "Are you ready for an adventure?",
    "Let's get started!"
];

var currentIndex = 0;

function speakNextLine() {
    if (currentIndex >= lines.length) {
        print("✅ No more lines to say!");
        return;
    }
    
    var text = lines[currentIndex];
    
    if (script.textBubble) {
        var textComponent = script.textBubble.getComponent("Component.Text");
        if (textComponent) {
            textComponent.text = text;
        } else {
            print("❗ Cannot find Text component on textBubble!");
        }
    }

    if (global.getTTSResults) {
        global.getTTSResults(text);
    }
    
    currentIndex++;
}

function setupButton() {
    if (!script.nextButton) {
        print("❗ Next Button not assigned!");
        return;
    }

    var interactableScript = script.nextButton.getComponent("Component.ScriptComponent");
    if (interactableScript && interactableScript) {
        print("We have interactable")
    } else {
        print("We don't have interactable")
    }
    if (interactableScript) {
        interactableScript.onTriggerStart.add(function() {
            speakNextLine();
        });
        print("✅ Connected to Interactable on Next Button!");
    } else {
        print("❗ Could not find Interactable script on Next Button!");
    }
}

// Run setup
setupButton();
speakNextLine(); // Say first line immediately
