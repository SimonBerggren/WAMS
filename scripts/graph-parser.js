function Text(x1, y1, x2, y2, string, lineColor, level, translate, scale) {
    if (translate === undefined) {
      translate = [0,0,0]
    } if (scale === undefined) {
      scale = [1,1,1]
    }
          textCanvas = document.createElement("canvas");
          textContext = textCanvas.getContext("2d");
          textCanvas.width = textContext.width = 8000;
          textCanvas.height = textContext.height = 2000;
          var col= "#"+new THREE.Color(lineColor[0], lineColor[1], lineColor[2]).getHexString();
          textContext.fillStyle = col;
          var text = string;
          var textDimensions;
          var fontSize = 4;
          do {
              textContext.font = ++fontSize + "px Arial";
              textDimensions = textContext.measureText(text);
          } while (fontSize < textContext.height && textDimensions.width < textContext.width);
          textContext.textAlign = "center";
          textContext.textBaseline = "middle";
          textContext.fillText(text, textCanvas.width/2, textCanvas.height/2);
          textTexture = new THREE.Texture(textCanvas);
          textTexture.needsUpdate = true;
          material = new THREE.MeshPhongMaterial({map: textTexture, side: THREE.DoubleSide});
          material.transparent = true;
          geometry = new THREE.PlaneBufferGeometry(x2-x1, y2-y1);
          mesh = new THREE.Mesh(geometry, material);
          mesh.position.set((x1+x2)/2, (y1+y2)/2, level*delta*scale[0]);
          mesh.userData.origColor = 0x1c6cc8;
          mesh.userData.pickingAllowed = true;
          calculateBoundingBox(mesh);
    return mesh;
}

function plane(x, y, w, h, c, z) {
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({color:c}));
	plane.position.x = x;
	plane.position.y = y;
	plane.position.z = z;
	return plane;    
}

var icons = {};

function loadFiles() {
	var loader = new THREE.ObjectLoader();
	loader.load("static/icons/IdealOpAmp3Pin.json", function (obj) { icons["IdealOpAmp3Pin"] = obj.clone(); } );
	loader.load("static/icons/Capacitor.json", function (obj) { icons["Capacitor"] = obj; } );
	loader.load("static/icons/Resistor.json", function (obj) { icons["Resistor"] = obj; } );

}

function makeTextSprite(x, y, message) {
	var fontface = "Arial";
	var fontsize = 5;
	var borderThickness = 0;
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	canvas.width = context.width = 64;
	canvas.height = context.height = 64;
	context.font = "Bold " + fontsize + "px " + fontface;
	context.fillText(message, canvas.width/2, canvas.height/2);
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;
	var material = new THREE.SpriteMaterial({ map: texture });
	var sprite = new THREE.Sprite(material);
	sprite.scale.set(10,10,1.0);
	return sprite;	
}
// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
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
					material = new THREE.MultiMaterial( [
					new THREE.MeshPhongMaterial( { color: 0, shading: THREE.FlatShading } ), // front
					new THREE.MeshPhongMaterial( { color: 0, shading: THREE.SmoothShading } ) // side
				] );
	});
});

function createText(group, text, x, y) {

	textGeo = new THREE.TextGeometry( text, {

		font: font,

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

	// "fix" side normals by removing z-component of normals for side faces
	// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

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

var scene = undefined;

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

// adds components, edges and connections to scene
function display_graph(graph, s, camera, display) {
	scene = s;
	for( var i = scene.children.length - 1; i >= 0; i--) { 
			scene.remove(scene.children[i]);
	}
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
  			createText(group, name, x, y); 			

 		  	var icon;
 		  	if (icons[cl] === undefined)
 		  		icon = plane(x, y, w, h, 0xff0000, 0);
 		  	else
 		  		icon = icons[cl].clone();

 		  	icon.position.x = x;
 		  	icon.position.y = y;
 		  	icon.position.z = 0;

	    	switch(cl) {
	    		case "IdealOpAmp3Pin":
	    		icon.scale.x = icon.scale.y = icon.scale.z = 10;
	    		icon.rotation.y = Math.PI;	
	    		break;
	    		case "Capacitor":
	    		icon.scale.x = icon.scale.y = icon.scale.z = 20;
	    		break;
	    		case "Resistor":
	    		icon.scale.x = icon.scale.y = icon.scale.z = 10;
	    		break;
	    	}
 		  	scene.add(icon);
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

			var line = new THREE.Geometry();
    		line.vertices.push(new THREE.Vector3(sourceX, sourceY, 0));

    		var bendPoints = edge.bendPoints;
			if (bendPoints !== undefined) {
	  			for(var j = 0; j < bendPoints.length; ++j) {
    				var bend = bendPoints[j];
    				var bendX = bend.x + offsetX;
    				var bendY = bend.y + offsetY;

    				scene.add(plane(bendX, bendY, 0, 0, 0x33cc33, -3));
    				line.vertices.push(new THREE.Vector3(bendX, bendY, 0));
   				}
		  	}

  			line.vertices.push(new THREE.Vector3(targetX, targetY, 0));
			scene.add(new THREE.Line(line, new THREE.LineBasicMaterial({color: 0x0000ff})));
    	}
	}