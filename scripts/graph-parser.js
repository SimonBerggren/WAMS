function cylinderMesh(pointX, pointY) {
            var direction = new THREE.Vector3().subVectors(pointY, pointX);
            var orientation = new THREE.Matrix4();
            orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
            orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
                0, 0, 1, 0,
                0, -1, 0, 0,
                0, 0, 0, 1));
            var edgeGeometry = new THREE.CylinderGeometry(2, 2, direction.length(), 8, 1);
            var edge = new THREE.Mesh(edgeGeometry, new THREE.MeshBasicMaterial( { color: 0x0000ff } ) );
            edge.applyMatrix(orientation);
            // position based on midpoints - there may be a better solution than this
            edge.position.x = (pointY.x + pointX.x) / 2;
            edge.position.y = (pointY.y + pointX.y) / 2;
            edge.position.z = (pointY.z + pointX.z) / 2;
            edge.name="edge"
            return edge;
}

var scene = undefined;
function plane(x, y, w, h, c, z) {
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({color:c}));
	plane.position.x = x;
	plane.position.y = y;
	plane.position.z = z;
	plane.name="plane";
	return plane;    
}

var icons = {};
var jsonloader = new THREE.ObjectLoader();
var svgloader = new THREE.TextureLoader();
var objloader = new THREE.ObjectLoader();
var lloader = new THREE.JSONLoader();

function UrlExists(url, iftrue, iffalse)
{
	$.get(url)
    .done(function() { 
        iftrue();
    }).fail(function() { 
        iffalse();
    })
}

function loadJSON(name, x, y, w, h, n) {

	if (n !== undefined) {
		var scale = 100;
		var obj = objloader.parse(JSON.parse(name));
		obj.scale.x = obj.scale.y = obj.scale.z = scale;
		scene.add(obj);
		return;
	}

	var url = "static/icons/" + name + ".json";
	UrlExists(url, function() {
			jsonloader.load(url
	, function(obj) {
 		  	obj.position.x = x;
 		  	obj.position.y = y;
 		  	obj.position.z = 0;

	    	switch(name) {
	    		case "IdealOpAmp3Pin":
	    		obj.scale.x = obj.scale.y = obj.scale.z = 10;
	    		obj.rotation.y = Math.PI;	
	    		break;
	    		case "Capacitor":
	    		obj.scale.x = obj.scale.y = obj.scale.z = 20;
	    		break;
	    		case "Resistor":
	    		obj.scale.x = obj.scale.y = obj.scale.z = 10;
	    		break;
	    	}
 		  	scene.add(obj);
 		  	createText(scene, name, x, y); 
	})
	}, function() {
		loadSVG(name, x, y, w, h);
	});
}

function loadSVG(name, x, y, w, h) {

		var url = "static/icons/" + name + ".svg";
	UrlExists(url, function() {
	svgloader.load(url, function (obj) { 
		var boxMaterial = new THREE.MeshBasicMaterial({map:obj});
		var boxGeometry2 = new THREE.BoxGeometry( 50, 50, 1 );
		var mainBoxObject = new THREE.Mesh(boxGeometry2,boxMaterial);
		mainBoxObject.position.set(x,y,0);
		scene.add(mainBoxObject);
	});
}, function() {
		scene.add(plane(x, y, w, h, 0xff0000, 0));
		createText(scene, name, x, y); 
	});
}

var font;
var size = 5;
var height = 1;
var curveSegments = 0;
var bevelThickness = 0;
var bevelSize = 0;
var bevelEnabled = 0;
var material;
var extrudeMaterial = 1;
var hover = 30;

$(function() {
	var loader = new THREE.FontLoader();
	loader.load( 'static/fonts/helvetiker_regular.typeface.json', function ( response ) {
		font = response;
		material = new THREE.MultiMaterial([
			new THREE.MeshPhongMaterial({color: 0, shading: THREE.FlatShading }),
			new THREE.MeshPhongMaterial({color: 0, shading: THREE.SmoothShading })
		]);
	});
});

function createText(group, text, x, y) {
	textGeo = new THREE.TextGeometry( text, {

		font: font,
		color: "white",

		size: size,
		height: height,
		curveSegments: curveSegments,

		bevelThickness: bevelThickness,
		bevelSize: bevelSize,
		bevelEnabled: bevelEnabled,

		material: material,
		extrudeMaterial: extrudeMaterial

	});

	textGeo.computeBoundingBox();
	textGeo.computeVertexNormals();

	if ( false ) {

		var triangleAreaHeuristics = 0.1 * ( height * size );

		for ( var i = 0; i < textGeo.faces.length; i ++ ) {

			var face = textGeo.faces[ i ];

			if ( face.materialIndex == 1 ) {

				for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

					face.vertexNormals[ j ].z = 0;
					face.vertexNormals[ j ].normalize();
				}

				var va = textGeo.vertices[ face.a ];
				var vb = textGeo.vertices[ face.b ];
				var vc = textGeo.vertices[ face.c ];

				var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

				if ( s > triangleAreaHeuristics ) {

					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

						face.vertexNormals[ j ].copy( face.normal );

					}

				}

			}

		}

	}

	var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

	textMesh1 = new THREE.Mesh( textGeo, material );

	textMesh1.position.x = x + centerOffset;
	textMesh1.position.y = y - (height / 2);
	textMesh1.position.z = 15;

	textMesh1.rotation.x = 0;
	textMesh1.rotation.y = Math.PI * 2;

	group.add( textMesh1 );
}

function calculate_graph(graph, s, camera) {
	var worker = new Worker('klayjs.js');
    var config = '{' + "spacing: 0,\nalgorithm: de.cau.cs.kieler.klay.layered,\nedgeRouting: ORTHOGONAL" + '}';
    var _g = graph;
    var _s = s;
    var _c = camera;
    
    worker.addEventListener('message', function (e) {
    	var g = e.data;
		display_graph(g, _s, _c);
		
    });

    var parsed_graph = JSON.parse(graph);
		worker.postMessage({
		graph: parsed_graph,
		options: config
	});
}
function clearScene() {
	for( var i = scene.children.length - 1; i >= 0; i--) { 
		if (scene.children[i].name !== "important")
			scene.remove(scene.children[i]);
	}
}

function display_graph(graph, s, camera, display) {
	scene = s;
	if (display !== undefined) {
		var parsed_graph = JSON.parse(graph);
		for (var i = 0; i < parsed_graph.length; ++i) {
			var g = parsed_graph[i];
			var comps = g.children;
			var edges = g.edges;
			get_comps(comps, edges);
			camera.setOriginalPosition({x:g.width / 2, y:g.height / 2, z:500})
		}
	} else {
		var comps = graph.children;
		var edges = graph.edges;
		get_comps(comps, edges);
		camera.setOriginalPosition({x:graph.width / 2, y:graph.height / 2, z:500})
	}
}

function get_comps(comps, edges, parent) {
	var offsetX = (parent === undefined) ? 0 : parent.x;
	var offsetY = (parent === undefined) ? 0 : parent.y;

	for(var i = 0; i < comps.length; ++i) {
		var c = comps[i];
    	if (c.children !== undefined) {
    		var obj = c;
    		obj.x += offsetX;
    		obj.y += offsetY;
    		get_comps(c.children, c.edges, obj);
    	}
		var name = c.id;
    	var cl = c.class;
    	var w = c.width;
    	var h = c.height;
    	var x = c.x + w/2 + offsetX;
    	var y = c.y + h/2 + offsetY;
 	  	var tx = c.x + w + offsetX;
 	  	var ty = c.y + offsetY;
 
  	    var group = new THREE.Group();
		scene.add(group);

		loadJSON(cl, x, y, w, h);
	}
	
	for(var i = 0; i < edges.length; ++i) {

		var s = 7;
		var edge = edges[i];
		var sourceX = edge.sourcePoint.x + offsetX;
		var sourceY = edge.sourcePoint.y + offsetY;
		var targetX = edge.targetPoint.x + offsetX;
		var targetY = edge.targetPoint.y + offsetY;

		scene.add(plane(sourceX, sourceY, s, s, 0xffff1a, 0));
		scene.add(plane(targetX, targetY, s, s, 0xffff1a, 0));

		var bendPoints = edge.bendPoints;
		if (bendPoints !== undefined) {
			var firstBend = bendPoints[0];
			var lastBend = bendPoints[bendPoints.length - 1];
			scene.add(cylinderMesh(new THREE.Vector3(sourceX, sourceY, 0), new THREE.Vector3(firstBend.x + offsetX, firstBend.y + offsetY,0)));
  			for(var j = 0; j < bendPoints.length - 1; ++j) {
				var bend = bendPoints[j];
				var bendX = bend.x + offsetX;
				var bendY = bend.y + offsetY;
				var bend2 = bendPoints[j + 1];
				var bendX2 = bend2.x + offsetX;
				var bendY2 = bend2.y + offsetY;

				scene.add(cylinderMesh(new THREE.Vector3(bendX, bendY, 0), new THREE.Vector3(bendX2, bendY2,0)));
			}
			scene.add(cylinderMesh(new THREE.Vector3(lastBend.x + offsetX, lastBend.y + offsetY,0), new THREE.Vector3(targetX, targetY, 0)));
	  	} else {
	  		scene.add(cylinderMesh(new THREE.Vector3(sourceX, sourceY, 0), new THREE.Vector3(targetX,targetY,0)));	
	  	}			
	}
}