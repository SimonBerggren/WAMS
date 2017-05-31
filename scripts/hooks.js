// setup hooks for object control modes

var translationButton = document.getElementById("translation");
var rotationButton = document.getElementById("rotation");
var scalingButton = document.getElementById("scaling");

translationButton.onclick = function() {
	translationButton.classList.add("selected");
	rotationButton.classList.remove("selected");
	scalingButton.classList.remove("selected");
	object_controls_2d.setMode("translate");
	object_controls_3d.setMode("translate");
}

rotationButton.onclick = function() {
	translationButton.classList.remove("selected");
	rotationButton.classList.add("selected");
	scalingButton.classList.remove("selected");
	object_controls_2d.setMode("rotate");
	object_controls_3d.setMode("rotate");	
}

scalingButton.onclick = function() {
	translationButton.classList.remove("selected");
	rotationButton.classList.remove("selected");
	scalingButton.classList.add("selected");
	object_controls_2d.setMode("scale");
	object_controls_3d.setMode("scale");	
}
