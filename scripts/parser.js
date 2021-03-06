// contains functions for parsing graphs and models

// global variables
var icons_json = [];
var icons_svg = [];
var icon_types = [];
var icon_names = [];
var loaded_icons = 0;
var total_icons = 0;
var components;
var edges;
var IDs = [];
var edgeID;
var ports = [];
var minX, maxX, minY, maxY;
var resetCamera = true;	// always reset camera first time

// generate a new ID, i.e Clutch1 -> Clutch2
// pass class or oldId
function generateNewId(_oldId) {
    var r = /\d+/g;
    var newId = _oldId.replace(/\d+/g, '');  // strip ID of any digits
    if (isNaN(IDs[newId]))
    	IDs[newId] = 0;
    var num = IDs[newId]++;             // generate new digits to ID
    newId = newId + num;
    return newId.toString();
};

// called when we need Klay to parse the graph
function calculate_graph(_graph) {

	loaded_icons = 0;
	IDs = [];
	ports = [];

	if (_graph.children == undefined || _graph.children.length == 0) return;

    $klay.layout({

  		graph: _graph,

  		"options": klayOptions,

		"success": function(_parsed_graph) {

			displayParsedGraph(_parsed_graph);

		},
		"error": function(error) {

  			alert(error.text);

  		}
	});
};

// called when we dont want Klay to parse the graph
function display_graph(_graph, _icons) {

		loaded_icons = 0;
		IDs = [];
		ports = [];

		if (_graph.children == undefined || _graph.children.length == 0) return;

		if (_icons == undefined) {

			displayParsedGraph(_graph);

		} else {

			components = _graph.children;
			edges = _graph.edges;
			edgeID = edges.length;			
			parseIconsFile(_icons, iconsLoaded);
		}
};

// called when we have one large file containing all graphs and icons
function calculateCombinedGraph(_graph, _icons) {

	minX = maxX = minY = maxY = 0;
	loaded_icons = 0;
	IDs = [];
	ports = [];

	if (_graph.children == undefined || _graph.children.length == 0) return;	

    $klay.layout({

  		graph: _graph,

  		"options": klayOptions,

		"success": function(_parsed_graph) {

			components = _parsed_graph.children;
			edges = _parsed_graph.edges;
			edgeID = edges.length;

			parseIconsFile(_icons, iconsLoaded);

		},
		"error": function(error) {

  			alert(error.text);

  		}
	});
};

// loads all icons from a file
// if onIconsLoaded is defined,
// it is called when all icons in file are loaded into memory
function parseIconsFile(_icons, onIconsLoaded) {

	var total_icons = Object.keys(_icons).length;
	var curr_icon = 0;

	// load all icons from file
	for (var icon in _icons) {

		loadSVG(_icons[icon], icon, function() {
			// because onload is async, wait with parsing graph until icons are loaded
			if (onIconsLoaded !== undefined && ++curr_icon === total_icons) {
				iconsLoaded();
			}
		})
	}

	function load_svg(_icon) {

		// parse each icon, so we can extract width and height from its viewbox
		// and update canvas width and height
		var svg = _icons[_icon];
		var svg_element = domParser.parseFromString( svg, 'text/xml' ).documentElement;
		var viewbox = svg_element.getAttribute("viewBox").split(" ").map(Number);
		var new_width = parseInt(viewbox[2]);
		var new_height = parseInt(viewbox[3]);

		var img = document.createElement("img");
		img.setAttribute("src", "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svg))));

		// async operation
		img.onload = function() {
				var canvas = document.createElement('canvas');
			canvas.width = new_width; //Math.pow( 2, Math.round( Math.log( nw ) / Math.LN2 ) );
			canvas.height = new_height;//Math.pow( 2, Math.round( Math.log( nh ) / Math.LN2 ) );
		    canvas.getContext('2d').drawImage(img, 0, 0);

			var texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;

			icons_svg[_icon] = texture;
			icon_types[_icon] = "svg";
		};
	};
};

// called when we only want to add one new svg and already has the path
function loadSVG(_svg, _svgName, onLoad) {
	var svg_element = domParser.parseFromString( _svg, 'text/xml' ).documentElement;
	var viewbox = svg_element.getAttribute("viewBox").split(" ").map(Number);
	var new_width = parseInt(viewbox[2]);
	var new_height = parseInt(viewbox[3]);

	var img = document.createElement("img");
	img.setAttribute("src", "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(_svg))));

	// async operation
	img.onload = function() {
			var canvas = document.createElement('canvas');
		canvas.width = new_width; //Math.pow( 2, Math.round( Math.log( nw ) / Math.LN2 ) );
		canvas.height = new_height;//Math.pow( 2, Math.round( Math.log( nh ) / Math.LN2 ) );
	    canvas.getContext('2d').drawImage(img, 0, 0);

		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;

		icons_svg[_svgName] = texture;
		icon_types[_svgName] = "svg";

		if (onLoad !== undefined) {
			onLoad();
		}
	};
}

// starts with parsing the icons needed for displaying the graph
function displayParsedGraph(_graph) {

		minX = maxX = minY = maxY = 0;
		components = _graph.children;
		edges = _graph.edges;
		
		if (file_name == undefined) {
			iconsLoaded();
			return;
		}

		// check if there is a connected _Icons file to read icons from
		var icons_file_name = file_name.replace(/\.[^/.]+$/, "_Icons");	// replaces _KlayJS with _Icons
		var url = "static/" + icons_file_name + ".json";

		$.get(url)

		// if there is an icons file
		.success(function(_file) {

			parseIconsFile(JSON.parse(_file).icons, iconsLoaded);

		// if there is no icons file
		}).error(function() {

		function extract_icons(_comps) {

			// we need to traverse the components
			for(var i = 0; i < _comps.length; ++i) {

				var c = _comps[i];

				// and extract each unique icon of every component, port and child
				if (icon_types[c.class] === undefined) {
					icon_types[c.class] = null;	// set to null so we know we saved icon name
					icon_names.push(c.class);
				}

				if (c.ports !== undefined) {
					extract_icons(c.ports);
				}

				if (c.children !== undefined) {
					extract_icons(c.children);
				}
			}
		};

		extract_icons(components);

		// load each icon into the app
		for (var i = 0; i < icon_names.length; ++i)
				load_icon(icon_names[i]);

		// if there are no icons to load, go straight to parsing
		if (icon_names.length == 0)
			iconsLoaded();
	});
};

// loads an icon into the app
function load_icon(_icon_name) {

	var url = icons_directory + _icon_name + ".json";

	// start using jquery to see if icon url is accessible as .json
	$.get(url)
	.success(function() {

		jsonloader.load(url, function(_object) {

			icon_types[_icon_name] = "json";
			icons_svg[_icon_name] = _object;

			if (++loaded_icons >= total_icons)
				iconsLoaded();
		});

		// if not, try same url but with .svg
	}).error(function() {

		url = icons_directory + _icon_name + ".svg";

		$.get(url)
		.success(function() {

			svgloader.load(url, function (svg) {

				// nearest power of two, to prevent warning messages from THREE
				svg.image.width = Math.pow( 2, Math.round( Math.log( svg.image.width ) / Math.LN2 ) );
				svg.image.height = Math.pow( 2, Math.round( Math.log( svg.image.height ) / Math.LN2 ) );

				icon_types[_icon_name] = "svg";
				icons_svg[_icon_name] = svg;

				if (++loaded_icons >= total_icons)
					iconsLoaded();
			});

			// if neither json nor svg is present, save the type as a simple plane
		}).error(function() {

			icon_types[_icon_name] = "plane";
			if (++loaded_icons >= total_icons)
				iconsLoaded();

		});
	});
}

// function is called when all icons from a graph is loaded
// first clears scene of previous diagram or model
// then starts parsing the graph and adding new components to scene
function iconsLoaded() {

	clearScene();

	graphToScene(components, edges);

	camera_controls.setResetPosition((maxX - minX) / 2,   windowHeight - ( (maxY - minY) / 2));

	if (resetCamera) {
		camera_controls.reset();
		resetCamera = false;
	}
};

// parses the graph
// creates THREE JS objects out of components, ports and edges
// adds objects to scene
function graphToScene(_components, _edges, parent) {

	// in case this isnt a top level component we have to consider offsets
	var offsetX = parent === undefined ? 0 : parent.x;
	var offsetY = parent === undefined ? 0 : parent.y;

	for(var i = 0; i < _components.length; ++i) {

		var c = _components[i];
		c.x += offsetX;
		c.y += offsetY;

		var bottom_component = false;

		if (c.children !== undefined) {
			graphToScene(c.children, c.edges, c);
		} else {
			bottom_component = true;
		}

		var name = c.id;
		var cl = c.class;
		var w = c.width;
		var h = c.height;
		var x = c.x + w/2;
		var y = windowHeight - ( c.y + h/2 );

		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;

		// strip id from its digits
		// so we can keep check on which number is next when cloning
    	var regex_digits = /\d+/g;
    	var id_digits = name.match(regex_digits);
    	var id_name = name.replace(regex_digits, '');
    	var id_num = 0;
    	IDs[id_name] = 0;

    	if (id_digits !== null) {
    	    id_num = parseInt(id_digits.last()) + 1;
    	}
    	if (IDs[id_name] < id_num)
    		IDs[id_name] = id_num;

		var obj;
		var icon_type = icon_types[cl];

		// if this components icon is in svg format
		if (icon_type == "svg") {

			// only display a square wireframe if component is not at the bottom of the hierarchy
			if (!bottom_component)
				obj = wireframe(0, 0, w, h, 0x000000, 0);
			else {
				// otherwise map svg icon to material from icons_svg
				var material = new THREE.MeshLambertMaterial({map:icons_svg[cl], transparent:true});
				var geometry = new THREE.BoxGeometry( icons_svg[cl].image.width, icons_svg[cl].image.height, 0.01 );
				obj = new THREE.Mesh(geometry,material);
			}

			// if this components icon is in json format
		} else if (icon_type == "json") {

			parseJson(obj);

			// if icon doesnt exist
		} else {

			obj = wireframe(0, 0, w, h, 0x000000, 0);

		}

		// keep components and their ports as part of one object in THREE
		var group = new THREE.Group();
		group.userData = c;
		group.userData.connections = [];
		group.add(obj);
		group.setType("component");

		// rotate around origin
		if (c.origin !== undefined) {
  			group.applyMatrix( new THREE.Matrix4().makeTranslation(-(c.x-c.origin[0]), -(c.y-c.origin[1]) ,0) );
  			group.applyMatrix( new THREE.Matrix4().makeRotationZ(c.rotation  *  Math.PI/180.0 ) );
  			//group.applyMatrix( new THREE.Matrix4().makeTranslation(c.x+c.x-c.origin[0], c.y-c.height/2+c.y-c.origin[1], 0) );
  			group.applyMatrix( new THREE.Matrix4().makeTranslation(c.x+c.x-c.origin[0], c.y+c.y-c.origin[1], 0) );
		} else {
			group.translateOnAxis(new THREE.Vector3(x, y, 0), 1);
		}

		// parse component's ports

		if (c.ports !== undefined && c.ports.length > 0) {

			for (var j = 0; j < c.ports.length; ++j) {

				var p = c.ports[j];
				var pw = p.width;
				var ph = p.height;
				var px = p.x - w/2 + pw/2;
				var py = -p.y + h/2 - ph/2;
				var pz = portZpos;
				var pin = plane(px, py, pz, pw * portScale, ph * portScale, portColor);

				pin.userData = p;
				pin.userData.source = name;
				pin.visible = false;
				pin.setType("port");
				ports.push(pin);
				group.add(pin);
			}
		}

		// add text
		var t = text(name);
		t.rotation.z = -group.rotation.z;
		t.userData.type = "text";
		group.add(t)
		group.setPickable();
		scene.add(group);
	}

	// edges

	if (_edges === undefined)
		return;

	for(var i = 0; i < _edges.length; ++i) {
		var edge = _edges[i];

		var sourceX = edge.sourcePoint.x + offsetX;
		var sourceY = windowHeight - ( edge.sourcePoint.y + offsetY );

		var targetX = edge.targetPoint.x + offsetX;
		var targetY = windowHeight - ( edge.targetPoint.y + offsetY );

		// keep connection and all its bendpoits and cylinders as one object in THREE
		var connection = new THREE.Group();

		// parse any bendpoints and add cylinders between components
		// add spheres to mimic curves on bendpoints

		var bendPoints = edge.bendPoints;
		
		if (bendPoints === undefined || bendPoints.length == 0) {

				connection.add(cylinder(new THREE.Vector3(sourceX, sourceY, 0), new THREE.Vector3(targetX,targetY,0)));	

			} else {

				var firstBend = bendPoints[0];
				var firstBendX = firstBend.x + offsetX;
				var firstBendY = windowHeight - ( firstBend.y + offsetY );

				var lastBend = bendPoints[bendPoints.length - 1];
				var lastBendX =lastBend.x + offsetX;
				var lastBendY = windowHeight - ( lastBend.y + offsetY );

				connection.add(cylinder(new THREE.Vector3(sourceX, sourceY, 0), new THREE.Vector3(firstBendX, firstBendY, 0)));

				for(var j = 0; j < bendPoints.length - 1; ++j) {

					var bend = bendPoints[j];
					var bendX = bend.x + offsetX;
					var bendY = windowHeight - ( bend.y + offsetY );
					var bend2 = bendPoints[j + 1];
					var bendX2 = bend2.x + offsetX;
					var bendY2 = windowHeight - ( bend2.y + offsetY );

					connection.add(sphere(bendX,bendY));

					connection.add(cylinder(new THREE.Vector3(bendX, bendY, 0), new THREE.Vector3(bendX2, bendY2,0)));
				}

				connection.add(sphere(lastBendX ,lastBendY));
				connection.add(cylinder(new THREE.Vector3(lastBendX, lastBendY ,0), new THREE.Vector3(targetX, targetY, 0)));
			}

			for (var j = 0; j < ports.length; ++j) {
				var p = ports[j];
				if (p.userData.id == edge.sourcePort) {

					connection.userData.startPort = p;

					if (p.parent.userData.connections === undefined)
						p.parent.userData.connections = [];
					p.parent.userData.connections.push(connection);
				} else if (p.userData.id == edge.targetPort) {

					connection.userData.endPort = p;
					
					if (p.parent.userData.connections === undefined)
						p.parent.userData.connections = [];
					p.parent.userData.connections.push(connection);
				}	
			}
			
			connection.userData.id = edge.id;
			connection.userData.numBendPoints = bendPoints == undefined ? 0 : bendPoints.length;
			connection.userData.startPosition = new THREE.Vector3(firstBendX, firstBendY, 0);
			connection.userData.endPosition = new THREE.Vector3(lastBendX, lastBendY, 0);
			connection.userData.startConnection = connection.children.first();
			connection.userData.endConnection = connection.children.last();
			connection.setPickable();
			connection.setType("edge");

			if (connection.userData.numBendPoints == 0) {
				connection.userData.startPosition = new THREE.Vector3(targetX, targetY, 0);
				connection.userData.endPosition = new THREE.Vector3(sourceX, sourceY, 0);
				connection.userData.startConnection = connection.children.first();
				connection.userData.endConnection = connection.children.first();
			}

			// connection.add(sphere(targetX ,targetY));
			// connection.add(sphere(sourceX, sourceY));

			scene.add(connection);
	}
};

// parse json objects
function parseJson(_object) {

	obj = icons_json[cl].clone();

	// javascript makes shallow copies of materials
	// changing opacity without making deep copies, changes opacity on all objects
	var copy_material = function(_object) {
		for (var i = 0; i < _object.children.length; ++i) {
			var c = _object.children[i];

			if (c.material !== undefined) {
				c.material = c.material.clone();
				c.material.transparent = true;
			}

			if (c.children !== undefined)
				loop(c);
		}
	};

	if (obj.children !== undefined)
		copy_material(obj);

	// scale of json objects is not configured correctly yet
	if (cl == "IdealOpAmp3Pin") {

		obj.scale.x = obj.scale.y = obj.scale.z = 10;
		obj.rotation.y = Math.PI;

	} else if (cl == "Capacitor") {

		obj.scale.x = obj.scale.y = obj.scale.z = 20;

	} else if (cl == "Resistor") {

		obj.scale.x = obj.scale.y = obj.scale.z = 10;

	}

	// json objects from THREE JS Editor contains light - we dont want that to affect our objects
	if (obj.children !== undefined) {
		for (var j = obj.children.length - 1; j >= 0; --j) {
			if (obj.children[j].type === "AmbientLight" || obj.children[j].type === "DirectionalLight")
				obj.remove(obj.children[j]);
		}
	}
};

// adds a 3D model to the scene, scales to 100 because test models are very small
function addModel(_model, _type) {
	var scale = 100;
	var obj;
	if (_type == "obj" || _type == "mtl") {
		if (material == undefined) {
			mtlloader.setPath("C:/Users/Simon/Desktop/Adelaide city/Adelaide city");
			material = mtlloader.parse(_model);
			material.preload();
			return;
		} else {
			objloader.setMaterials( material );
			obj = objloader.parse(_model);
			scale = 1;
			material = undefined;
		}
	} else {
		scale = 100;
		obj = jsonloader.parse(_model);
	}
	if (obj.type != "Scene") {
		obj.setPickable();
	} else {
		for (var i = 0; i < obj.children.length; ++i) {
			if (obj.children[i].type == "Object3D")	{ // only added pickable function to Object3D
				obj.children[i].setPickable = THREE.Group.prototype.setPickable;
				obj.children[i].setPickable();
			}
		}
	}
	obj.scale.x = obj.scale.y = obj.scale.z = scale;
	scene.add(obj);
	camera_controls.setResetPosition(0,0);
	camera_controls.reset();

	if (model != undefined && animation != undefined) {
        if (!document.body.classList.contains('is-animateable'))
            document.body.classList.add('is-animateable');
            animator.addAnimation(model, animation);
    }
};
