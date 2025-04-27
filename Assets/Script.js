
//@input Component.Text textComponent

var previousText = script.textComponent.text;

function updateText() {
    var currentText = script.textComponent.text;
    if (currentText !== previousText) {
        print("Text changed from: " + previousText + " to: " + currentText);
        previousText = currentText;
    }
}

script.createEvent("UpdateEvent").bind(updateText);