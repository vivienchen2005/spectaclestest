//@input Component.ScriptComponent textBubbleScript



script.printHelloWorld = function () {
    print('hello we are calling function from Voice ML');
  };

const voiceMLModule = require('LensStudio:VoiceMLModule');

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

let onListeningErrorHandler = function(eventErrorArgs) {
    print('❗ Speech Recognition Error: ' + eventErrorArgs.error + ' desc: ' + eventErrorArgs.description);
};


// --- Hook up VoiceML events ---
voiceMLModule.onListeningEnabled.add(onListeningEnabledHandler);
voiceMLModule.onListeningDisabled.add(onListeningDisabledHandler);
voiceMLModule.onListeningUpdate.add(onUpdateListeningEventHandler);
voiceMLModule.onListeningError.add(onListeningErrorHandler);



