function cylinder(pointX, pointY) {
	var direction = new THREE.Vector3().subVectors(pointY, pointX);
	var orientation = new THREE.Matrix4();
	orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
	orientation.multiply(new THREE.Matrix4().set(
		1, 0, 0, 0,
	    0, 0, 1, 0,
	    0, -1, 0, 0,
	    0, 0, 0, 1));
	var edgeGeometry = new THREE.CylinderGeometry(2, 2, direction.length(), 8, 1);
	var edge = new THREE.Mesh(edgeGeometry, new THREE.MeshPhongMaterial( { color: "gray"  } ) );
	edge.applyMatrix(orientation);
	edge.position.set(
		(pointY.x + pointX.x) / 2,
		(pointY.y + pointX.y) / 2,
		(pointY.z + pointX.z) / 2);
	edge.name="pickable"
	edge.userData = edge.material.color.clone();
	return edge;
}

function sphere(x, y) {
	var geometry = new THREE.SphereGeometry( 2, 5, 5);
	var material = new THREE.MeshPhongMaterial( {color: "gray"} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.position.x = x;
	sphere.position.y = y;
	sphere.position.z = 0;
	sphere.name="static"
	return sphere;
}

function plane(x, y, w, h, c, z) {
	var geometry = new THREE.PlaneGeometry(w, h, 1, 1);
	var material = new THREE.MeshPhongMaterial({color:c});
	var plane = new THREE.Mesh(geometry, material);
	var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

var mat = new THREE.LineBasicMaterial( { color: "black", linewidth: 2 } );
	var wireframe = new THREE.LineSegments( geo, mat );
	plane.material.side = THREE.DoubleSide;
	plane.position.x = x;
	plane.position.y = y;
	plane.position.z = z;
	plane.name="static";
	return wireframe;    
}

function text(text, x, y) {

	var size = 5;
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

	var centerOffset = (-0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x ));

	textMesh1 = new THREE.Mesh( textGeo, material );

	textMesh1.position.x = x + centerOffset;
	textMesh1.position.y = y - (height / 2);
	textMesh1.position.z = 15;

	textMesh1.rotation.x = 0;
	textMesh1.rotation.y = Math.PI * 2;

	textMesh1.name="static";

	return textMesh1;
};