var icons_json = [];
var icons_svg = [];
var icon_types = [];
var icon_names = [];
var icons = [];
var loaded_icons = 0;
var total_icons = 0;
var components;
var edges;
var IDs = [];
var ports = [];
var minX, maxX, minY, maxY;
var worker = new Worker('klayjs.js');
var klayOptions = {spacing:graphSpacing, algorithm: "de.cau.cs.kieler.klay.layered", layoutHierarchy: true};


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

function addIcon(_icon) {

	var url = icons_directory + _icon + ".json";

	$.get(url)
	.success(function() {
		
		jsonloader.load(url, function(_object) {

			icon_types[_icon] = "json";
			icons_svg[_icon] = _object;			

			if (++loaded_icons >= total_icons)
				onLoadedIcons();
		});

	}).error(function() {
		
		url = icons_directory + _icon + ".svg";

		$.get(url)
		.success(function() { 
	
			svgloader.load(url, function (svg) { 

				// nearest power of two
				svg.image.width = Math.pow( 2, Math.round( Math.log( s.width ) / Math.LN2 ) );
				svg.image.height = Math.pow( 2, Math.round( Math.log( s.height ) / Math.LN2 ) );
				
				icon_types[_icon] = "svg";
				icons_svg[_icon] = svg;
	
				if (++loaded_icons >= total_icons)
					onLoadedIcons();
			});

		}).error(function() { 
		
			icon_types[_icon] = "plane";
			if (++loaded_icons >= total_icons)
				onLoadedIcons();

		});
	});
}

function onLoadedIcons() {

	get_comps(components, edges);

	camera_controls.setResetPosition((maxX - minX) / 2,   windowHeight - ( (maxY - minY) / 2) );
	camera_controls.reset();
};

function calculate_graph(graph) {
		
	icons = [];
	loaded_icons = 0;
	IDs = [];
	ports = [];

    $klay.layout({

  		"graph": JSON.parse(graph),

  		"options": klayOptions,

		"success": function(graph) {

			displayParsedGraph(graph);

		},
		"error": function(error) { 

  			alert(error.text);

  		}
	});
};

function display_graph(graph) {
		icons = [];
		loaded_icons = 0;
		IDs = [];
		ports = [];

		parsed_graph = JSON.parse(graph);

		if (parsed_graph.hasOwnProperty("children"))
			displayParsedGraph(parsed_graph);
		else
			for (var i = 0; i < parsed_graph.length; ++i)
				displayParsedGraph(parsed_graph[i]);
};

function displayParsedGraph (graph) {
		file_name = file_name.replace(/\.[^/.]+$/, "_Icons");
		var url = "static/" + file_name + ".json";
		minX = maxX = minY = maxY = 0;
		components = graph.children;
		edges = graph.edges;

		$.get(url)
		.success(function(_object) {

			var json_dict = JSON.parse(_object).icons;
			var parser = new DOMParser();

			var total_icons = Object.keys(json_dict).length;
			var curr_icon = 0;

			for (var icon in json_dict) {

				load_icon(icon);

			}

			function load_icon(_icon) {
				
				var svg = json_dict[_icon]; 
  				var svg_element = parser.parseFromString( svg, 'text/xml' ).documentElement;
	  			var viewbox = svg_element.getAttribute("viewBox").split(" ").map(Number);
	  			var new_width = parseInt(viewbox[2]);
	  			var new_height = parseInt(viewbox[3]);

	  			var img = document.createElement("img");
				img.setAttribute("src", "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svg))));

				img.onload = function() {
		  			var canvas = document.createElement('canvas');
					canvas.width = new_width; //Math.pow( 2, Math.round( Math.log( nw ) / Math.LN2 ) );
					canvas.height = new_height;//Math.pow( 2, Math.round( Math.log( nh ) / Math.LN2 ) );
				    canvas.getContext('2d').drawImage(img, 0, 0);

	  				var texture = new THREE.Texture(canvas);
	  				texture.needsUpdate = true;
				
					icons_svg[_icon] = texture;
					icon_types[_icon] = "svg";

					if (++curr_icon === total_icons) {
						onLoadedIcons();
					}
				};
			};			

		}).error(function() { 

		function get_icons(_comps) {

			for(var i = 0; i < _comps.length; ++i) {

				var c = _comps[i];

				if (icon_types[c.class] === undefined) {
					icon_names.push(c.class);
				}

				if (c.ports !== undefined) {
					get_icons(c.ports);
				}

				if (c.children !== undefined) {
					get_icons(c.children);
				}
			}
		};

		get_icons(components);

		if (icon_names.length == 0)
			onLoadedIcons();
		else if (!iconsDict)
			for (var i = 0; i < icon_names.length; ++i)
				addIcon(icon_names[i]);
			
	});
};

function get_comps(_components, _edges, parent) {

	var offsetX = parent === undefined ? 0 : parent.x;
	var offsetY = parent === undefined ? 0 : parent.y;

	for(var i = 0; i < _components.length; ++i) {

		var c = _components[i];
		c.x += offsetX;
		c.y += offsetY;
				
		var bottom_component = false;

		if (c.children !== undefined) {
			get_comps(c.children, c.edges, c);
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

		if (icon_type == "svg") {

			if (!bottom_component)
				obj = wireframe(0, 0, w, h, 0x000000, 0);
			else {
				var material = new THREE.MeshLambertMaterial({map:icons_svg[cl], transparent:true});
				var geometry = new THREE.BoxGeometry( icons_svg[cl].image.width, icons_svg[cl].image.height, 0.01 );
				obj = new THREE.Mesh(geometry,material);
			}

		} else if (icon_type == "json") {

			parseJson(obj);

		} else {

			obj = wireframe(0, 0, w, h, 0x000000, 0);

		}

		var group = new THREE.Group();
		group.userData = c;
		group.add(obj);

		if (c.origin !== undefined) {
  			group.applyMatrix( new THREE.Matrix4().makeTranslation(-(c.x-c.origin[0]), -(c.y-c.origin[1]) ,0) );
  			group.applyMatrix( new THREE.Matrix4().makeRotationZ(c.rotation  *  Math.PI/180.0 ) );
  			group.applyMatrix( new THREE.Matrix4().makeTranslation(c.x+c.x-c.origin[0], c.y-c.height/2+c.y-c.origin[1], 0) );
		} else {
			group.translateOnAxis(new THREE.Vector3(x, y, 0), 1);
		}

		// ports

		if (c.ports !== undefined && c.ports.length > 0) {

			for (var j = 0; j < c.ports.length; ++j) {

				var p = c.ports[j];
				var pw = p.width;
				var ph = p.height;
				var px = p.x - w/2 + pw/2;
				var py = -p.y + ( h/2 - ph/2 );

				var pin = plane(px, py, pw, ph, 0x0000ff, 0.5, 1);
				pin.userData = p;
				pin.userData.source = name;
				pin.visible = false;
				ports.push(pin);
				group.add(pin);
			}
		}

		// add text and to scene

		group.add(text(name))
		group.children.last().rotation.z = -group.rotation.z;
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

		var connection = new THREE.Group();

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
			
			connection.userData.id = edge.id;
			connection.setPickable();
			scene.add(connection);
	}
};

function parseJson(_object) {

	obj = icons_json[cl].clone();

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

	if (cl == "IdealOpAmp3Pin") {

		obj.scale.x = obj.scale.y = obj.scale.z = 10;
		obj.rotation.y = Math.PI;

	} else if (cl == "Capacitor") {

		obj.scale.x = obj.scale.y = obj.scale.z = 20;

	} else if (cl == "Resistor") {

		obj.scale.x = obj.scale.y = obj.scale.z = 10;

	}

	if (obj.children !== undefined) {
		for (var j = obj.children.length - 1; j >= 0; --j) {
			if (obj.children[j].type === "AmbientLight" || obj.children[j].type === "DirectionalLight")
				obj.remove(obj.children[j]);
		}
	}	

};