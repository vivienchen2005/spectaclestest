// Main Controller
//
// Made with Easy Lens

//@input Component.ScriptComponent bitmojiAnimation
//@input Component.ScriptComponent touchEvents


try {

script.bitmojiAnimation.enabled = true;

// Function to randomize Bitmoji friends on tap
script.touchEvents.onTap.add(function() {
    script.bitmojiAnimation.randomizeFriends();
});

// Example of changing bitmoji expressions and positions
function updateBitmojiProperties() {
    global.getTTSResults("Hello");

    script.bitmojiAnimation.bitmoji1Enabled = true;
    script.bitmojiAnimation.bitmoji1FacialExpression = "happy";
    script.bitmojiAnimation.bitmoji1OffsetPosition = new vec2(0.1, -0.1);
    script.bitmojiAnimation.bitmoji1OffsetRotation = 45;
}

updateBitmojiProperties();

} catch(e) {
  print("error in controller");
  print(e);
}
