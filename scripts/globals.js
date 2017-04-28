var directionalLightPosition = {x: 0, y: 0, z: 10};
var directionalLightColor = "white";
var directionalLightIntensity = 0.7;

var ambientLightColor = "white";
var ambientLightIntensity = 0.5;

var connectionSize = 2;
var klayAspect = 10;
var graphSpacing = 50;
var klayOptions = {spacing: graphSpacing, algorithm: "de.cau.cs.kieler.klay.layered", aspectRatio: klayAspect};

var clearColor = "oldlace";
var subsystemColor = "blue";
var connectionColor = "gray";

var cameraFrontClip = 1;
var cameraBackClip = 20000;
var camerFieldOfView = 50;

var textEnabled = true;
var textOffsetX = 0;
var textOffsetY = -110;
var textSize = 20;

var windowHeightPercentage = 0.85;
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight * windowHeightPercentage;

var showingStats = false;

var scalingStep = 20; // higher = smaller steps

var camera = undefined;
var scene = undefined;
var input = undefined;
var animator = undefined;
var camera_controls_2d = undefined;
var camera_controls_3d = undefined;
var camera_controls = undefined;
var object_controls = undefined;
var file_name = undefined;

var icons_directory = "static/icons";

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