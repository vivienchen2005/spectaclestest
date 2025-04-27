import { PinchButton } from "./SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";

const lines = [
    "Hi there!",
    "Welcome to the park!",
    "Are you ready for an adventure?",
    "Let's get started!",
    "What's your name?"
];

@component
export class SpeechManager extends BaseScriptComponent {
    @input
    private button: PinchButton
    @input('Component.ScriptComponent')
    private TTSController: any;
    @input('Component.ScriptComponent')
    private textBubbleScript: any;

    private currentIndex = 0;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.button.onButtonPinched.add(() => {
                this.speakNextLine();
            })
        })
    }

    speakNextLine() {
        if (this.currentIndex >= lines.length) {
            this.currentIndex = 0;
        }
        print(lines[this.currentIndex]);
        this.TTSController.getTTSResults(lines[this.currentIndex]);
        this.textBubbleScript.text = lines[this.currentIndex];
        this.currentIndex++;
    }
}
