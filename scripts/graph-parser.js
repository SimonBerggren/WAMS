var icons = {};


function urlExists(url, onTrue, onFalse)
{
	$.get(url)
    .done(function() { 
        onTrue();
    }).fail(function() { 
        onFalse();
    })
}

function addModel(model) {
	var scale = 100;
	var obj = objloader.parse(model);
	obj.scale.x = obj.scale.y = obj.scale.z = scale;
	scene.add(obj);
}

function addJSON(name, desc, x, y, w, h) {

	var url = "static/icons/" + name + ".json";
	urlExists(url, function() {
		jsonloader.load(url, function(obj) {
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
	    	};

	    	function setName(name, obj) {
	    		obj.name = name;
	    		if (obj.children !== undefined) {
	    			for (var i = 0; i < obj.children.length; ++i){
    					setName(name, obj.children[i]);
	    			}
	    		}
	    	};

	    	setName("pickable", obj);
 		  	scene.add(obj);
	    	scene.add(text(desc, x, y));
 		  	
	})
	}, function() {
		addSVG(name, desc, x, y, w, h);
	});
}

function addSVG(name, desc, x, y, w, h) {

	var url = "static/icons/" + name + ".svg";
		urlExists(url, 
			function() {
				svgloader.load(url, function (obj) { 
					var boxMaterial = new THREE.MeshBasicMaterial({map:obj});
					var boxGeometry2 = new THREE.BoxGeometry( 50, 50, 1 );
					var mainBoxObject = new THREE.Mesh(boxGeometry2,boxMaterial);
					mainBoxObject.position.set(x,y,0);
					mainBoxObject.userData = mainBoxObject.material.color.clone();
					mainBoxObject.name = "pickable";
					scene.add(mainBoxObject);
				});
			}, function() {
				var obj = plane(x, y, w, h, 0xff0000, 0);
				scene.add(obj);
				scene.add(text(desc, x, y));
	});
}

function calculate_graph(graph) {
	var worker = new Worker('klayjs.js');
    var config = '{' + "spacing: 0,\nalgorithm: de.cau.cs.kieler.klay.layered,\nedgeRouting: ORTHOGONAL" + '}';
    var parsed_graph = JSON.parse(graph);

    worker.addEventListener('message', function (e) {
		var graph = e.data;
		var comps = graph.children;
		var edges = graph.edges;
		get_comps(comps, edges);	
    });
    
	worker.postMessage({
		graph: parsed_graph,
		options: config
	});
};

function display_graph(graph) {
	var parsed_graph = JSON.parse(graph);

	for (var i = 0; i < parsed_graph.length; ++i) {

		var g = parsed_graph[i];
		var comps = g.children;
		var edges = g.edges;
		get_comps(comps, edges);
	}
};

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

		addJSON(cl, name, x, y, w, h);
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

		if (bendPoints !== undefined && bendPoints.length > 0) {

			var firstBend = bendPoints[0];
			var lastBend = bendPoints[bendPoints.length - 1];

			scene.add(cylinder(new THREE.Vector3(sourceX, sourceY, 0), new THREE.Vector3(firstBend.x + offsetX, firstBend.y + offsetY,0)));
			
  			for(var j = 0; j < bendPoints.length - 1; ++j) {

				var bend = bendPoints[j];
				var bendX = bend.x + offsetX;
				var bendY = bend.y + offsetY;
				var bend2 = bendPoints[j + 1];
				var bendX2 = bend2.x + offsetX;
				var bendY2 = bend2.y + offsetY;

  				scene.add(sphere(bendX,bendY));

				scene.add(cylinder(new THREE.Vector3(bendX, bendY, 0), new THREE.Vector3(bendX2, bendY2,0)));
			}

			scene.add(sphere(lastBend.x + offsetX,lastBend.y + offsetY));
			scene.add(cylinder(new THREE.Vector3(lastBend.x + offsetX, lastBend.y + offsetY,0), new THREE.Vector3(targetX, targetY, 0)));

	  	} else {

	  		scene.add(cylinder(new THREE.Vector3(sourceX, sourceY, 0), new THREE.Vector3(targetX,targetY,0)));	
	  	}			
	}
};