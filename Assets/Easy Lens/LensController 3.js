
//@input Component.ScriptComponent bitmojiAnimation
//@input Component.ScriptComponent textBubble

try {

script.textBubble.enabled = true;

script.createEvent('UpdateEvent').bind(function() {
  var bitmojiHeadPos = script.bitmojiAnimation.getBitmojiPosition2D(0);
  if (!bitmojiHeadPos) {
    return;
  }
  // Sets position of speech bubble based on Bitmoji position
  script.textBubble.position = new vec2(bitmojiHeadPos.x, bitmojiHeadPos.y);
});

// Update Bitmoji facial expression to simulate talking
script.bitmojiAnimation.bitmoji1FacialExpression = "amused"; // or use "happy" based on desired effect

} catch(e) {
  print("error in controller");
  print(e);
}


