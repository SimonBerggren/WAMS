var camera = undefined;
var scene = undefined;
var input = undefined;
var animator = undefined;

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

var clearScene = function() {
	for( var i = scene.children.length - 1; i >= 0; i--) { 
		if (scene.children[i].name !== "important")
		scene.remove(scene.children[i]);
	}
};