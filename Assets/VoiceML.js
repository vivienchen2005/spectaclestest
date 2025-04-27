//@input Component.ScriptComponent textBubbleScript

const voiceMLModule = require('LensStudio:VoiceMLModule');

// --- 1. Listening options ---
let options = VoiceML.ListeningOptions.create();
options.speechRecognizer = VoiceMLModule.SpeechRecognizer.Default;
options.languageCode = 'en_US';
options.shouldReturnAsrTranscription = true;
options.shouldReturnInterimAsrTranscription = true;

// --- 2. Functions ---
script.printHelloWorld = function () {
    print('🖐️ Stop button pressed - stopping VoiceML!');
    voiceMLModule.stopListening();
};

let onListeningEnabledHandler = function () {
    print("✅ VoiceML Listening Started!");
    voiceMLModule.startListening(options);
};

let onListeningDisabledHandler = function () {
    print("🛑 VoiceML Listening Stopped!");
};

let onUpdateListeningEventHandler = function (eventArgs) {
    if (!eventArgs.transcription || eventArgs.transcription.trim() === '') {
        return;
    }

    print('🗣️ Transcription: ' + eventArgs.transcription);

    // API CALL with the transcript


    // Get the Response from the API and send it to th text bubble

    // Update text bubble on FINAL speech
    if (eventArgs.isFinalTranscription && script.textBubbleScript) {
        script.textBubbleScript.text = eventArgs.transcription;
    }
};

let onListeningErrorHandler = function(eventErrorArgs) {
    print('❗ Speech Recognition Error: ' + eventErrorArgs.error + ' desc: ' + eventErrorArgs.description);
};

// --- 3. Hook up VoiceML Events ---
voiceMLModule.onListeningEnabled.add(onListeningEnabledHandler);
voiceMLModule.onListeningDisabled.add(onListeningDisabledHandler);
voiceMLModule.onListeningUpdate.add(onUpdateListeningEventHandler);
voiceMLModule.onListeningError.add(onListeningErrorHandler);