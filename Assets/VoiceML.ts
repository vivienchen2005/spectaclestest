import { Interactable } from "./SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable";
import NativeLogger from "./SpectaclesInteractionKit/Utils/NativeLogger";

const log = new NativeLogger("MyNativeLogger");

@component
export class VoiceManager extends BaseScriptComponent {
    @input('Component.ScriptComponent')
    private textBubbleScript: any;
    private options = VoiceML.ListeningOptions.create();
    private voiceMLModule: VoiceMLModule = require("LensStudio:VoiceMLModule");



    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
            log.d("Onstart event triggered");
            print("Onstart event triggered");
        });
    }


    onStart() {
        this.setupVoiceML();
    }

    setupVoiceML() {
        // Setup Listening Options
        this.options.speechRecognizer = VoiceMLModule.SpeechRecognizer.Default;
        this.options.languageCode = 'en_US';
        this.options.shouldReturnAsrTranscription = true;
        this.options.shouldReturnInterimAsrTranscription = true;

        // Hook up VoiceML events
        this.voiceMLModule.onListeningEnabled.add(() => this.onListeningEnabled());
        this.voiceMLModule.onListeningDisabled.add(() => this.onListeningDisabled());
        this.voiceMLModule.onListeningUpdate.add((eventArgs: any) => this.onListeningUpdate(eventArgs));
        this.voiceMLModule.onListeningError.add((eventErrorArgs: any) => this.onListeningError(eventErrorArgs));
    }

    onListeningEnabled() {
        print("✅ VoiceML Listening Started!");
        this.voiceMLModule.startListening(this.options);
    }

    onListeningDisabled() {
        print("🛑 VoiceML Listening Stopped!");
        this.voiceMLModule.stopListening();
    }

    onListeningUpdate(eventArgs: any) {
        if (!eventArgs.transcription || eventArgs.transcription.trim() === '') {
            return;
        }

        print('🗣️ Transcription: ' + eventArgs.transcription);

        if (eventArgs.isFinalTranscription && this.textBubbleScript) {
            this.textBubbleScript.text = eventArgs.transcription;
        }
    }

    onListeningError(eventErrorArgs: any) {
        print('❗ Speech Recognition Error: ' + eventErrorArgs.error + ' desc: ' + eventErrorArgs.description);
    }

    stopListening() {
        this.voiceMLModule.stopListening();
        print("🖐️ Stop Button Pressed! VoiceML stopped.");
    }
}
