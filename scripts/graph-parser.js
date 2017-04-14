var Component = function (component) {
	var id = component.id;
	var name = component.class;
	var w = c.width;
	var h = c.height;
	var x = c.x + w/2;
	var y = c.y + h/2;

	var addPort = function(port) {

	};

	return {

	};
}

var icons_json = [];
var icons_svg = [];
var names = [];
var icons = [];
var bounding_boxes = [];
var loaded_icons = 0;
var components;
var edges;
var all_components = [];
var worker = new Worker('klayjs.js');
var config = '{' + "spacing: 100,algorithm: de.cau.cs.kieler.klay.layered,edgeRouting: ORTHOGONAL" + '}';



worker.addEventListener('message', function (e) {
	_display_graph(e.data);
});

function urlExists(url, onTrue, onFalse)
{
	$.get(url)
	.success(function() { 
		onTrue();
	}).error(function() { 
		onFalse();
	})
};

function setModelName(model) {
	model.name = {name:"pickable", id:model.name};

	if (model.children !== undefined)
		for (var j = 0; j < model.children.length; ++j) {
			setModelName(model.children[j]);
	}
};

function addModel(model) {
	var scale = 100;
	var obj = objloader.parse(model);
	obj.scale.x = obj.scale.y = obj.scale.z = scale;
	setModelName(obj);
	scene.add(obj);
};

	function addIcon(name) {

		var url = "static/icons/" + name + ".json";

		urlExists(url, function() {
			jsonloader.load(url, function(obj) {
				names[name] = "json";

				icons_json[name] = obj;

				


				if (++loaded_icons == icons.length)
					onLoadedIcons();
			});
}, function() {	// JSON doesnt exist

	var url = "static/icons/" + name + ".svg";

	urlExists(url, 
		function() {
			svgloader.load(url, function (svg) { 
				names[name] = "svg";
// nearest power of two
var s = svg.image;
s.width = Math.pow( 2, Math.round( Math.log( s.width ) / Math.LN2 ) );
s.height = Math.pow( 2, Math.round( Math.log( s.height ) / Math.LN2 ) );
var material = new THREE.MeshLambertMaterial({map:svg, transparent:true});
var geometry = new THREE.BoxGeometry( 50, 50, 1 );
var mesh = new THREE.Mesh(geometry,material);
icons_svg[name] = mesh;
if (++loaded_icons == icons.length)
	onLoadedIcons();
});
}, function() {	// SVG doesnt exist

	names[name] = "plane";
	if (++loaded_icons == icons.length)
		onLoadedIcons();
});
});
	}

	function onLoadedIcons() {

		bounding_boxes = [];

		get_comps(components, edges);

		camera_controls.reset();

	};

	function calculate_graph(graph) {
		icons = [];
		loaded_icons = 0;

		worker.postMessage({
			graph: JSON.parse(graph),
			config: config,
			iFormat: "org.json",
			oFormat: "org.json"
		});
	};

	function display_graph(graph) {
		icons = [];
		loaded_icons = 0;

		parsed_graph = JSON.parse(graph);
		for (var i = 0; i < parsed_graph.length; ++i)
			_display_graph(parsed_graph[i]);
	};

	function _display_graph (graph) {
		camera_controls.setResetPosition(graph.width / 2, graph.height / 2);
		components = graph.children;
		edges = graph.edges;

		console.log(graph);

		get_icons(components);

		if (icons.length == 0)
			get_comps(components, edges);
		else
			for (var i = 0; i < icons.length; ++i)
				addIcon(icons[i]);
		};

		function get_icons(comps) {

			for(var i = 0; i < comps.length; ++i) {

				var c = comps[i];

				if (names[c.class] === undefined) {
					names[c.class] = 0;
					icons.push(c.class);
				}

				if (c.ports !== undefined) {
					get_icons(c.ports);
				}

				if (c.children !== undefined) {
					get_icons(c.children);
				}
			}
		};

		function get_comps(comps, edges, parent) {

			var offsetX = parent === undefined ? 0 : parent.x;
			var offsetY = parent === undefined ? 0 : parent.y;

			for(var i = 0; i < comps.length; ++i) {

				var c = comps[i];
				c.x += offsetX;
				c.y += offsetY;

				if (c.children !== undefined)
					get_comps(c.children, c.edges, c);

				var name = c.id;
				var cl = c.class;
				var w = c.width;
				var h = c.height;
				var x = c.x + w/2;
				var y = c.y + h/2;
				var obj;

				switch (names[cl]) {
					case "svg":
					obj = icons_svg[cl].clone();
					obj.material = new THREE.MeshLambertMaterial({map:icons_svg[cl].material.map, transparent:true});
//obj.material.map = icons_svg[cl].map.clone();

break;
case "json":

obj = icons_json[cl].clone();

function loop(o) {
						for (var i = 0; i < o.children.length; ++i) {
							var c = o.children[i];

							if (c.material !== undefined) {
								var m = c.material.clone();
								c.material = m;//new THREE.MeshLambertMaterial({transparent:true});
								c.material.transparent = true;
							}

							if (c.children !== undefined)
								loop(c);
					}
				}
				if (obj.children !== undefined)
					loop(obj);

switch(cl) {
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
if (obj.children !== undefined) {
	for (var j = obj.children.length - 1; j >= 0; --j) {
		if (obj.children[j].type === "AmbientLight" || obj.children[j].type === "DirectionalLight")
			obj.remove(obj.children[j]);
	}
}

break;
default:
obj = wireframe(x, y, w, h, 0x000000, 0);

break;
}
var group = new THREE.Group();
group.position.set(x, y, 0);
group.add(obj);

if (c.ports !== undefined && c.ports.length > 0) {

	group.userData = [];

	for (var j = 0; j < c.ports.length; ++j) {
		var p = c.ports[j];

		if (p.class === "Pin") {

			var pw = p.width;
			var ph = p.height;
			var px = p.x - w/2 + pw/2;
			var py = p.y - h/2 + ph/2;

			var pin = plane(px, py, pw, ph, 0xff0000, 1);
			pin.userData = p;
			pin.userData.source = name;
			//pin.scale.set(2,2,2);
			pin.visible = false;
			group.add(pin);
		}
	}


	for(var j = 1; j < group.children.length; ++j) {
		var box = new THREE.Box3().setFromObject(group.children[j], group);
		group.userData.push(box);
		bounding_boxes.push(box);
		box.userData=group.children[j].userData;
	}
}

group.add(text(name, 0,0))
setName(group);
scene.add(group);

function setName(o) {
	o.name = {name:"pickable", id:name, class:cl};

	if (o.children !== undefined)
		for (var j = 0; j < o.children.length; ++j) {
			setName(o.children[j]);
		}
	};
}

if (edges !== undefined)
	for(var i = 0; i < edges.length; ++i) {

		var s = 7;
		var edge = edges[i];
		var sourceX = edge.sourcePoint.x + offsetX;
		var sourceY = edge.sourcePoint.y + offsetY;
		var targetX = edge.targetPoint.x + offsetX;
		var targetY = edge.targetPoint.y + offsetY;

		var source = plane(sourceX, sourceY, s, s, 0xffff1a, 0);
		var target = plane(targetX, targetY, s, s, 0xffff1a, 0);

		scene.add(source);
		scene.add(target);

		scene.updateMatrixWorld();

		var connection = new THREE.Group();

		var bendPoints = edge.bendPoints;

		if (bendPoints !== undefined && bendPoints.length > 0) {

			var firstBend = bendPoints[0];
			var firstBendX = firstBend.x + offsetX;
			var firstBendY = firstBend.y + offsetY;
			var lastBend = bendPoints[bendPoints.length - 1];
			var lastBendX = lastBend.x + offsetX;
			var lastBendY = lastBend.y + offsetY;

			connection.add(cylinder(new THREE.Vector3(sourceX, sourceY, 0), new THREE.Vector3(firstBendX, firstBendY, 0)));

			for(var j = 0; j < bendPoints.length - 1; ++j) {

				var bend = bendPoints[j];
				var bendX = bend.x + offsetX;
				var bendY = bend.y + offsetY;
				var bend2 = bendPoints[j + 1];
				var bendX2 = bend2.x + offsetX;
				var bendY2 = bend2.y + offsetY;

				connection.add(sphere(bendX,bendY));

				connection.add(cylinder(new THREE.Vector3(bendX, bendY, 0), new THREE.Vector3(bendX2, bendY2,0)));
			}

			connection.add(sphere(lastBendX ,lastBendY));
			connection.add(cylinder(new THREE.Vector3(lastBendX, lastBendY ,0), new THREE.Vector3(targetX, targetY, 0)));

		} else {
			connection.add(cylinder(new THREE.Vector3(sourceX, sourceY, 0), new THREE.Vector3(targetX,targetY,0)));	
		}

		connection.userData = {
			sourceComp: edge.source,
			targetComp: edge.target,
			sourcePort: edge.sourcePort,
			targetPort: edge.targetPort
		};
//connection.name="pickable";
scene.add(connection);
}
};