// contains functions for creating various objects

// connections are made from cylinders
function cylinder(pointX, pointY) {
	
	var direction = new THREE.Vector3().subVectors(pointY, pointX);
	var orientation = new THREE.Matrix4();
	orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
	orientation.multiply(new THREE.Matrix4().set(
		1, 0, 0, 0,
	    0, 0, 1, 0,
	    0, -1, 0, 0,
	    0, 0, 0, 1));
	var edgeGeometry = new THREE.CylinderGeometry(connectionSize, connectionSize, direction.length(), 8, 1);
	var edge = new THREE.Mesh(edgeGeometry, new THREE.MeshPhongMaterial( { color: connectionColor, transparent: true } ) );
	edge.applyMatrix(orientation);
	edge.position.set(
		(pointY.x + pointX.x) / 2,
		(pointY.y + pointX.y) / 2,
		(pointY.z + pointX.z) / 2);
	edge.userData.start = pointX;
	edge.userData.end = pointY;
	return edge;
}

// bendpoints are made from spheres
function sphere(x, y) {
	var geometry = new THREE.SphereGeometry( connectionSize, 8, 8);
	var material = new THREE.MeshPhongMaterial( {color: connectionColor} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.position.x = x;
	sphere.position.y = y;
	sphere.position.z = 0;
	sphere.name="static"
	return sphere;
}

// wireframe only creates a square frame, used for components that contains children
function wireframe(x, y, w, h, c, z) {
	var geometry = new THREE.EdgesGeometry( new THREE.PlaneGeometry(w, h, 1, 1) ); // or WireframeGeometry( geometry )
	var material = new THREE.LineBasicMaterial( { color: subsystemColor, linewidth: 2 } );
	var wireframe = new THREE.LineSegments( geometry, material );
	wireframe.position.set(x,y,z);
	return wireframe;    
}

// ports are made from planes, they are simply a solid coloured 2D plane
function plane(x, y, z, w, h, c) {
	var geometry = new THREE.PlaneGeometry(w, h, 1, 1);
	var material = new THREE.MeshLambertMaterial({color:c, transparent:true});
	var plane = new THREE.Mesh(geometry, material);
	plane.position.set(x,y,z);
	return plane;    
}

// creates 3D text, though quite heavy on the GPU
function text(text) {

	if (!textEnabled)
		return new THREE.Mesh();

	var size = textSize;
	var hover = 30;
	var height = 1;
	var bevelSize = 0;
	var bevelEnabled = 0;
	var curveSegments = 0;
	var bevelThickness = 0;
	var extrudeMaterial = 1;
	var material = new THREE.MultiMaterial([
		new THREE.MeshPhongMaterial({color: 0, shading: THREE.FlatShading }),
		new THREE.MeshPhongMaterial({color: 0, shading: THREE.SmoothShading })
	]);

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

	var centerOffset = (-0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x ));

	textMesh1 = new THREE.Mesh( textGeo, material );

	textMesh1.position.x = centerOffset + textOffsetX;
	textMesh1.position.y = -(height / 2) + textOffsetY;
	textMesh1.position.z = 15;

	textMesh1.rotation.x = 0;
	textMesh1.rotation.y = Math.PI * 2;

	return textMesh1;
};