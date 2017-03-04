var PERSP_CAMERA;

THREE.CombinedCamera = function ( width, height, fov, near, far, orthoNear, orthoFar ) {

  THREE.Camera.call( this );

  this.fov = fov;

  this.left = - width / 2;
  this.right = width / 2;
  this.top = height / 2;
  this.bottom = - height / 2;

  // We could also handle the projectionMatrix internally, but just wanted to test nested camera objects

  this.cameraO = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2,  orthoNear, orthoFar );
  this.cameraP = new THREE.PerspectiveCamera( fov, width / height, near, far );

  this.zoom = 1;

  this.toPerspective();

  PERSP_CAMERA = new THREE.PerspectiveCamera( fov, width / height, near, far );
  this.add(PERSP_CAMERA);

};

var CAMERA_OBJ = undefined;
var CAMERA_OBJ2 = undefined;
var CONTROLS = undefined;


THREE.CombinedCamera.prototype = Object.create( THREE.Camera.prototype );
THREE.CombinedCamera.prototype.constructor = THREE.CombinedCamera;

THREE.CombinedCamera.prototype.getPerspective = function () {
  return this.cameraP;
}

THREE.CombinedCamera.prototype.toPerspective = function () {

  this.near = this.cameraP.near;
  this.far = this.cameraP.far;

  this.cameraP.fov =  this.fov / this.zoom ;

  this.cameraP.updateProjectionMatrix();

  this.projectionMatrix = this.cameraP.projectionMatrix;

  this.inPerspectiveMode = true;
  this.inOrthographicMode = false;

};

THREE.CombinedCamera.prototype.toOrthographic = function () {

  // Switches to the Orthographic camera estimating viewport from Perspective

  var fov = this.fov;
  var aspect = this.cameraP.aspect;
  var near = this.cameraP.near;
  var far = this.cameraP.far;

  // The size that we set is the mid plane of the viewing frustum

  var hyperfocus = ( near + far ) / 2;

  var halfHeight = Math.tan( fov * Math.PI / 180 / 2 ) * hyperfocus;
  var halfWidth = halfHeight * aspect;

  halfHeight /= this.zoom;
  halfWidth /= this.zoom;

  this.cameraO.left = - halfWidth;
  this.cameraO.right = halfWidth;
  this.cameraO.top = halfHeight;
  this.cameraO.bottom = - halfHeight;

  // this.cameraO.left = -farHalfWidth;
  // this.cameraO.right = farHalfWidth;
  // this.cameraO.top = farHalfHeight;
  // this.cameraO.bottom = -farHalfHeight;

  // this.cameraO.left = this.left / this.zoom;
  // this.cameraO.right = this.right / this.zoom;
  // this.cameraO.top = this.top / this.zoom;
  // this.cameraO.bottom = this.bottom / this.zoom;

  this.cameraO.updateProjectionMatrix();

  this.near = this.cameraO.near;
  this.far = this.cameraO.far;
  this.projectionMatrix = this.cameraO.projectionMatrix;

  this.inPerspectiveMode = false;
  this.inOrthographicMode = true;

};


THREE.CombinedCamera.prototype.setSize = function( width, height ) {

  this.cameraP.aspect = width / height;
  this.left = - width / 2;
  this.right = width / 2;
  this.top = height / 2;
  this.bottom = - height / 2;

};


THREE.CombinedCamera.prototype.setFov = function( fov ) {
  this.fov = fov;
  if ( this.inPerspectiveMode ) {
    this.toPerspective();
  } else {
    this.toOrthographic();
  }
};

// For maintaining similar API with PerspectiveCamera

THREE.CombinedCamera.prototype.updateProjectionMatrix = function() {

  if ( this.inPerspectiveMode ) {

    this.toPerspective();

  } else {

    this.toPerspective();
    this.toOrthographic();

  }

};

/*
* Uses Focal Length (in mm) to estimate and set FOV
* 35mm (full frame) camera is used if frame size is not specified;
* Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
*/
THREE.CombinedCamera.prototype.setLens = function ( focalLength, filmGauge ) {

  if ( filmGauge === undefined ) filmGauge = 35;

  var vExtentSlope = 0.5 * filmGauge /
      ( focalLength * Math.max( this.cameraP.aspect, 1 ) );

  var fov = THREE.Math.RAD2DEG * 2 * Math.atan( vExtentSlope );

  this.setFov( fov );

  return fov;

};


THREE.CombinedCamera.prototype.setZoom = function( zoom ) {

  this.zoom = zoom;

  if ( this.inPerspectiveMode ) {

    this.toPerspective();

  } else {

    this.toOrthographic();

  }

};

THREE.CombinedCamera.prototype.moveFwd = function( distance ) {
  var d = CONTROLS.getDirection();
  var p = CAMERA_OBJ.position;
  CAMERA_OBJ.position.set(p.x + d.x * distance, p.y + d.y * distance, p.z + d.z * distance);
  this.update();
}

THREE.CombinedCamera.prototype.moveBwd = function( distance ) {
  var d = CONTROLS.getDirection();
  var p = CAMERA_OBJ.position;
  CAMERA_OBJ.position.set(p.x + d.x * -distance, p.y + d.y * -distance, p.z + d.z * -distance);
  this.update();
}

THREE.CombinedCamera.prototype.moveRight = function( distance ) {
  var d = CONTROLS.getRight();
  var p = CAMERA_OBJ.position;
  CAMERA_OBJ.position.set(p.x + d.x * distance, p.y + d.y * distance, p.z + d.z * distance);
  this.update();
}

THREE.CombinedCamera.prototype.moveLeft = function( distance ) {
  var d = CONTROLS.getRight();
  var p = CAMERA_OBJ.position;
  CAMERA_OBJ.position.set(p.x + d.x * -distance, p.y + d.y * -distance, p.z + d.z * -distance);
  this.update();
}

THREE.CombinedCamera.prototype.RollRight = function( rotation ) {
}

THREE.CombinedCamera.prototype.RollLeft = function( rotation ) {
}

THREE.CombinedCamera.prototype.reset = function() {
  CAMERA_OBJ.position.set(this.oPos.x, this.oPos.y, this.oPos.z);
};

THREE.CombinedCamera.prototype.update = function() {
};

THREE.CombinedCamera.prototype.setOriginalPosition = function(position) {
  this.oPos = new THREE.Vector3(position.x, position.y, position.z);
  CAMERA_OBJ.position.set(this.oPos.x, this.oPos.y, this.oPos.z);
};