//const voiceMLModule = require('LensStudio:VoiceMLModule');

//@input SceneObject interactablePinchButton

/*

// Create listening options
let options = VoiceML.ListeningOptions.create();
options.speechRecognizer = VoiceMLModule.SpeechRecognizer.Default;
options.languageCode = 'en_US';
options.shouldReturnAsrTranscription = true;
options.shouldReturnInterimAsrTranscription = true;

// --- VoiceML Callbacks ---
let onListeningEnabledHandler = function () {
    print("✅ VoiceML Listening Started!");
    voiceMLModule.startListening(options);
};

let onListeningDisabledHandler = function () {
    print("🛑 VoiceML Listening Stopped!");
    voiceMLModule.stopListening();
};

let onUpdateListeningEventHandler = function (eventArgs) {
    if (!eventArgs.transcription || eventArgs.transcription.trim() === '') {
        return;
    }

    print('🗣️ Transcription: ' + eventArgs.transcription);

    // Update text bubble on FINAL speech
    if (eventArgs.isFinalTranscription && script.textBubbleScript) {
        script.textBubbleScript.text = eventArgs.transcription;
    }
};

let onListeningErrorHandler = function (eventErrorArgs) {
    print('❗ Speech Recognition Error: ' + eventErrorArgs.error + ' desc: ' + eventErrorArgs.description);
};


// --- Hook up VoiceML events ---
voiceMLModule.onListeningEnabled.add(onListeningEnabledHandler);
voiceMLModule.onListeningDisabled.add(onListeningDisabledHandler);
voiceMLModule.onListeningUpdate.add(onUpdateListeningEventHandler);
voiceMLModule.onListeningError.add(onListeningErrorHandler);
*/


// Wait for other components to initialize by deferring to OnStartEvent.
script.createEvent('OnStartEvent').bind(() => {
    onStart();
});

function onStart() {
    // Initialize SIK
    const SIK = require("SpectaclesInteractionKit/SIK").SIK;
    const interactionManager = SIK.InteractionManager;

    if (!script.interactableObject) {
        print(
            "Warning: Please assign a SceneObject with an Interactable component in the inspector"
        );
        return;
    }

    // Get the Interactable from the referenced SceneObject
    const interactable = interactionManager.getInteractableBySceneObject(
        script.interactableObject
    );

    if (!interactable) {
        print(
            "Warning: Could not find Interactable component on the referenced SceneObject"
        );
        return;
    }

    // Define the callback for trigger end event
    const onTriggerEndCallback = (event) => {
        handleTriggerEnd(event);
        print(
            `Interaction triggered by: ${event.interactor.inputType} at position: ${event.interactor.targetHitInfo.hit.position}`
        );
    };

    // Bind the callback to the trigger end event
    interactable.onInteractorTriggerEnd(onTriggerEndCallback);
}

async function handleTriggerEnd(eventData) {
    // do thing 
    print("we click");
}
