import { Interactable } from "./SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable";
import { InteractorEvent } from "./SpectaclesInteractionKit/Core/Interactor/InteractorEvent";
import NativeLogger from "./SpectaclesInteractionKit/Utils/NativeLogger";
import { VoiceML } from './VoiceML_Declaration';

const log = new NativeLogger("MyNativeLogger");

@component
export class ExampleLensManager extends BaseScriptComponent {

 @input
 @allowUndefined
 @hint("The button that will create the prefab object")
 createButton: Interactable;

 @input('Component.ScriptComponent')
 refScript: VoiceML;


 onAwake() {

   this.createEvent("OnStartEvent").bind(() => {
     this.onStart();
     log.d("Onstart event triggered");
     print("Onstart event triggered");
   });

 }

 onStart() {


   // Create an event callback function for the create button
   let onTriggerStartCallback = (event: InteractorEvent) => {
     
       log.d("Clicked Button.");
       print("Clicked Button.");
    
           // Check if refScript is defined and has the function
    if (this.refScript && typeof this.refScript.printHelloWorld === 'function') {
        this.refScript.printHelloWorld();
    } else {
        log.e("refScript is not assigned or does not have printHelloWorld.");
        print("❗ Error: refScript is not assigned or does not have printHelloWorld.");
    }
   };
   // Add the event listener to the create button onInteractorTriggerStart
   this.createButton.onInteractorTriggerStart(onTriggerStartCallback);
   // Add the event listener to the left hand onPinchDown

 }


}