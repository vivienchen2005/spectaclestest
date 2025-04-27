import { PinchButton } from "./SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";
import { setTimeout } from "./SpectaclesInteractionKit/Utils/FunctionTimingUtils";

@component
export class SpeechManager extends BaseScriptComponent {
    @input
    private button: PinchButton;
    
    @input('Component.ScriptComponent')
    private TTSController: any;
    
    @input('Component.ScriptComponent')
    private textBubbleScript: any;
    
    @input('Component.ScriptComponent')
    private userBubbleScript: any;

    @input('Component.ScriptComponent')
    private correctionsBubbleScript: any;
    
    private currentIndex = 0;
    private url = "https://hello-world-bpye.onrender.com/generate";
    private remoteServiceModule: RemoteServiceModule = require("LensStudio:RemoteServiceModule");
    private session_id = null;
    private previousText: string = ""; // <-- Keep track of previous text

    private sampleLines: string[] = [
        "Hi there!",
        "Welcome to the park!",
        "Are you ready for an adventure?",
        "Let's get started!",
        "What's your name?"
    ];

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            if (this.button) {
                this.button.onButtonPinched.add(() => {
                    this.speakNextLine(this.userBubbleScript.text || "");
                });
            }
            if (this.userBubbleScript) {
                this.previousText = this.userBubbleScript.text || "";
            }
        });

        this.createEvent("UpdateEvent").bind(() => {
            this.checkTextUpdate();
        });

        this.callAPI().then(() => {
            print("Initial API call completed successfully.");
        }
        ).catch((error) => {
            print("Error during initial API call: " + error);
        }
        );
    }

    async checkTextUpdate() {
        if (!this.userBubbleScript) {
            return;
        }

        let currentText = this.userBubbleScript.text || "";
        if (currentText !== this.previousText) {
            print("User text changed from: " + this.previousText + " to: " + currentText);
            this.previousText = currentText;

            try {
                await this.callAPI();
                print("API call completed successfully.");
            } catch (error) {
                print("Error during API call: " + error);
            }
        }
    }

    async callAPI() {
        print("Calling API with user input: " + this.userBubbleScript.text);

        let payload = {
            "scenario": "",
            "user_input": "Hi wassup bro",
            "language": "english",
            "id": 1
        };

        const request = new Request(
            this.url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        let response = await this.remoteServiceModule.fetch(request);

        if (response.status == 200) {
            let jsonResponse = await response.json();
            print("Received API response:");
            print(JSON.stringify(jsonResponse, null, 2));

            this.textBubbleScript.text = jsonResponse.response.ai_response.response;
            this.correctionsBubbleScript.text = jsonResponse.response.ai_response.corrective_actions.join("\n");
            this.speakNextLine(this.textBubbleScript.text);

            // Optionally: you can update something else with the response here
        } else {
            print("Failed to fetch questions: " + response.status);
        }
    }

    speakNextLine(text:string) {
        if (this.TTSController) {
            this.TTSController.getTTSResults(text);
        }
    }
}
