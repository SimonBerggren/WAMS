function plane(x, y, w, h, c, z) {
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 1, 1), new THREE.MeshBasicMaterial({color:c}));
	plane.position.x = x;
	plane.position.y = y;
	plane.position.z = z;
	return plane;    
}

var IdealOpAmp3Pin;
var Capacitor;
var Resistor;


function loadFiles() {
	var loader = new THREE.ObjectLoader();
	loader.load("static/IdealOpAmp3Pin.json", function (obj) { IdealOpAmp3Pin = obj.clone(); } );
	loader.load("static/Capacitor.json", function (obj) { Capacitor = obj.clone(); } );
	loader.load("static/Resistor.json", function (obj) { Resistor = obj.clone(); } );
}

function makeTextSprite(message, x, y) {
	var canvas = document.createElement('canvas');
	canvas.width = 1024;
	canvas.height = 1024;
	var context = canvas.getContext('2d');
	context.font = "Bold 200px Helvetica";
	context.fillStyle = "rgba(0, 0, 0,0.95)";
	context.fillText(message, 0, 0);
	
	// use canvas contents as a texture
	var texture = new THREE.Texture(canvas)
	texture.needsUpdate = true;

	var material = new THREE.MeshBasicMaterial( {map: texture, side:THREE.DoubleSide } );
	material.transparent = true;

	var mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    material
  );

	return mesh;	
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

// adds components, edges and connections to scene
function display_graph(graph, scene) {
	scene.children.forEach(function(object){
	scene.remove(object);
	});
	this.graph = graph;

	var worker = new Worker('klayjs.js');
    var config = '{' + "spacing: 0,\nalgorithm: de.cau.cs.kieler.klay.layered,\nedgeRouting: ORTHOGONAL" + '}';

    worker.addEventListener('message', function (e) {
    var graph = e.data;
    var comps = graph.children;
    var edges = graph.edges;
	get_comps(comps, edges);
    });

    var parsed_graph = JSON.parse(graph);
    worker.postMessage({
      graph: parsed_graph,
      options: config
	});

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
	
	    	var cl = c.class;
	    	var w = c.width;
	    	var h = c.height;
	    	var x = c.x + w/2 + offsetX;
	    	var y = c.y + h/2 + offsetY;
     	  	var tx = c.x + w + offsetX;
     	  	var ty = c.y + offsetY;
 
     	  	var text = makeTextSprite(c.id, x, y);
     	  	text.position.set(x, y, -1);
 		  	scene.add(text);

	    	switch(cl) {
	    		case "IdealOpAmp3Pin":
	    		var amp = IdealOpAmp3Pin.clone();
	    		amp.position.x = x;
	    		amp.position.y = y;
	    		amp.scale.x = amp.scale.y = amp.scale.z = 10;
	    		amp.rotation.y = Math.PI;	
	    		scene.add(amp);
	    		break;
	    		case "Capacitor":
	    		var cap = Capacitor.clone();
	    		cap.position.x = x;
	    		cap.position.y = y;
	    		cap.scale.x = cap.scale.y = cap.scale.z = 20;
	    		scene.add(cap);
	    		break;
	    		case "Resistor":
	    		var res = Resistor.clone();
	    		res.position.x = x;
	    		res.position.y = y;
	    		res.scale.x = res.scale.y = res.scale.z = 10;
	    		scene.add(res);
	    		break;
	    		default:
   		  		scene.add(plane(x, y, w, h, 0xff0000, -7));
	    		break;
	    	}
		}
	
  		for(var i = 0; i < edges.length; ++i) {

    		var s = 7;
    		var edge = edges[i];
    		var sourceX = edge.sourcePoint.x + offsetX;
    		var sourceY = edge.sourcePoint.y + offsetY;
    		var targetX = edge.targetPoint.x + offsetX;
    		var targetY = edge.targetPoint.y + offsetY;

  			scene.add(plane(sourceX, sourceY, s, s, 0xffff1a, -5));
  			scene.add(plane(targetX, targetY, s, s, 0xffff1a, -5));

			var line = new THREE.Geometry();
    		line.vertices.push(new THREE.Vector3(sourceX, sourceY, -10));

    		var bendPoints = edge.bendPoints;
			if (bendPoints !== undefined) {
	  			for(var j = 0; j < bendPoints.length; ++j) {
    				var bend = bendPoints[j];
    				var bendX = bend.x + offsetX;
    				var bendY = bend.y + offsetY;

    				scene.add(plane(bendX, bendY, 0, 0, 0x33cc33, -3));
    				line.vertices.push(new THREE.Vector3(bendX, bendY, -10));
   				}
		  	}

  			line.vertices.push(new THREE.Vector3(targetX, targetY, -10));
			scene.add(new THREE.Line(line, new THREE.LineBasicMaterial({color: 0x0000ff})));
    	}
	}
}