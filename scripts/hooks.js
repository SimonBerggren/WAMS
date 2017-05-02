// 

var translationButton = document.getElementById("translation");
var rotationButton = document.getElementById("rotation");
var scalingButton = document.getElementById("scaling");

translationButton.onclick = function() {
	translationButton.classList.add("btn-primary");
	rotationButton.classList.remove("btn-primary");
	scalingButton.classList.remove("btn-primary");
	object_controls.setMode("translate");
}

rotationButton.onclick = function() {
	translationButton.classList.remove("btn-primary");
	rotationButton.classList.add("btn-primary");
	scalingButton.classList.remove("btn-primary");
	object_controls.setMode("rotate");
}

scalingButton.onclick = function() {
	translationButton.classList.remove("btn-primary");
	rotationButton.classList.remove("btn-primary");
	scalingButton.classList.add("btn-primary");
	object_controls.setMode("scale");
}