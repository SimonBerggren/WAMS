// contains global variables for easier tweaking

// SCENE
var clearColor = "#ffffcc";
var copySpacing = 150;

// DIRECTIONAL LIGHT

// override color or intensity by adding them as attributes to json objects in list
var directionalLights = [
	{
		position: {x: 0, y: 0, z: 10}
	},
	{
		position: {x: 0, y: 20, z: 10}
	}
];

var directionalLightColor = "white";
var directionalLightIntensity = 0.7;

// AMBIENT LIGHT

var ambientLightColor = "white";
var ambientLightIntensity = 0.5;

// KLAY

var klayAspect = 10;
var graphSpacing = 50;
var klayOptions = {spacing: graphSpacing, algorithm: "de.cau.cs.kieler.klay.layered", aspectRatio: klayAspect};

// COMPONENTS, PORTS & CONNECTIONS

var connectionSize = 2;
var subsystemColor = "blue";
var connectionColor = "gray";
var connectionSelectedColor = "red";
var portColor = "blue";
var portSelectedColor = "red";
var selectedComponentOpacity = 0.5;
var portScale = 2;
var portColor = "blue";
var portZpos = 0.5;	// so ports dont clip with components

// CAMERA

var cameraFrontClip = 1;
var cameraBackClip = 20000;
var camerFieldOfView = 50;

// TEXT

var textEnabled = false;
var textOffsetX = 0;
var textOffsetY = -110;
var textSize = 20;

// WINDOW

var windowHeightPercentage = 1;
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight * windowHeightPercentage;

// SHORTCUTS

var cloneHoldKey = 17;      // hold CTRL and click component to clone
var cloneKey = 86;          // clone component with V
var deleteKey = 46;         // delete component with delete
var translationKey = 87;    // activate translation mode on W
var rotationKey = 69;       // activate rotation mode on E
var scalingKey = 82;        // activate scaling mode on R
var resetKey = 27;          // reset camera on ESC
var statsKey = 9;           // show stats with TAB

var showingStats = false;
var manual_mode = false;
var model_mode = false;
var control3d_mode = false;

var scalingStep = 100; // higher = smaller steps

var camera = undefined;
var scene = undefined;
var input = undefined;
var animator = undefined;
var animation = undefined;
var model = undefined;
var graph = undefined;
var graph_fixed = undefined;
var graph_nested = undefined;
var combined_mode = false;

var material = undefined;
var camera_controls_2d = undefined;
var camera_controls_3d = undefined;
var camera_controls = undefined;
var object_controls = undefined;
var file_name = undefined;
var parsedJSON = {};

var icons_directory = "static/icons";

var jsonloader = new THREE.ObjectLoader();
var svgloader = new THREE.TextureLoader();
var objloader = new THREE.OBJLoader();
var mtlloader = new THREE.MTLLoader();
var fontLoader = new THREE.FontLoader();
var fileReader = new FileReader();
var domParser = new DOMParser();

var font;

/*$(function() {
	fontLoader.load( 'static/fonts/helvetiker_regular.typeface.json', function ( response ) {
		font = response;
	});
});*/

var resetScene = function() {

	model = undefined;
	animation = undefined;
	graph = undefined;
	graph_icons = undefined;
	graph_fixed = undefined;
	graph_fixed_icons = undefined;
	graph_nested = undefined;
	graph_nested_icons = undefined;	

}

var clearScene = function() {
	for( var i = scene.children.length - 1; i >= 0; i--) {
		if (scene.children[i].userData.type !== "static") {
			scene.children[i].userData.connections = undefined;
			scene.remove(scene.children[i]);
		}

	}
};
