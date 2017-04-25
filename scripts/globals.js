var connectionSize = 1;
var graphSpacing = 50;
var clearColor = "oldlace";
var subsystemColor = "blue";
var connectionColor = "gray";

var cameraFrontClip = 1;
var cameraBackClip = 20000;

var camera = undefined;
var scene = undefined;
var input = undefined;
var animator = undefined;
var camera_controls_2d = undefined;
var camera_controls_3d = undefined;
var camera_controls = undefined;
var object_controls = undefined;
var file_name = undefined;

var jsonloader = new THREE.ObjectLoader();
var svgloader = new THREE.TextureLoader();
var objloader = new THREE.ObjectLoader();
var fontLoader = new THREE.FontLoader();
var fileReader = new FileReader();

var font;

$(function() {
	fontLoader.load( 'static/fonts/helvetiker_regular.typeface.json', function ( response ) {
		font = response;
	});
});

var resetScene;

var clearScene = function() {
	for( var i = scene.children.length - 1; i >= 0; i--) { 
		if (scene.children[i].name.name !== "important")
		scene.remove(scene.children[i]);
	}
	resetScene();
};