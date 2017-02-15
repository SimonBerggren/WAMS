/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var _camera = camera;

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;

	this.update = function ( x, y ) {

		yawObject.rotation.y -= x;
		pitchObject.rotation.x -= y;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
	};

	this.getObject = function () {
		return yawObject;
	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated
		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( pitchObject.rotation.x, yawObject.rotation.y, 0, "YXZ" );
		direction.applyEuler( rotation );
		return direction;
	};

	this.getRight = function() {
				var direction = new THREE.Vector3( 1, 0, 0 );
		var rotation = new THREE.Euler( pitchObject.rotation.x, yawObject.rotation.y, 0, "YXZ" );
		direction.applyEuler( rotation );
		return direction;
	}

};
