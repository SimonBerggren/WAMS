(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();

$(function() {
  var perspective_camera = true;
  var leftmousedown_graph = false;
  var rightmousedown_graph = false;
  var graph;
  var keys = {
    W: false,
    A: false,
    S: false,
    D: false
  }
  var W = 87;
    var A = 65;
    var S = 83;
    var D = 68;
    var TAB = 9;
    var ESC = 27;
  var scene = new THREE.Scene();
  loadFiles(scene);
  var w = window.innerWidth;
  var h = 600;



  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xEEEEEE, 1 );
  renderer.setSize(w, h);


  var minZoom = 0.1;
  var camera = new THREE.CombinedCamera(w/2, h/2,
   45, 1, 1000, -500

   , 1000);
  camera.position.z = 400;
  var controls = new THREE.FlyControls( camera );

  var omx = 0;
  var omy = 0;
  var dmx = 0;
  var dmy = 0;

  function render() {
    requestAnimationFrame(render)
    var delta = clock.getDelta();
    if (leftmousedown_graph) {
        camera.position.x -= dmx * 5;
        camera.position.y += dmy * 5;
    } else if (rightmousedown_graph) {
      controls.movementSpeed = 0.33;
      var x = dmx * 50;
      var y =  dmy * 50;
      var limit = 1000;
      x = Math.clamp(x, -limit, limit);
      y = Math.clamp(y, -limit, limit);
      controls.updateMouse(x, y);
      controls.update( delta );
    }
    if (keys.W) {
      camera.moveFwd(1);
    } else if (keys.S) {
            camera.moveBwd(1);
    } if (keys.A) {
              camera.moveLeft(1);
    } else if (keys.D) {
            camera.moveRight(1);
    }
      dmx = dmy = 0;
    renderer.render(scene, camera);
  }

  $('#glcontainer').on('mousedown', function(event) {
    if(event.button == 0)
    leftmousedown_graph = true;
  else if (event.button == 2)
    rightmousedown_graph = true;
  }).bind('DOMMouseScroll mousewheel', function(event) {
    camera.moveBwd(event.originalEvent.wheelDeltaY);
  }).append(renderer.domElement);
  var clock = new THREE.Clock();
  render();
  $(document).on('contextmenu', function(event) {
    event.preventDefault();
  }).on('mouseup', function() {
    leftmousedown_graph = false;
    rightmousedown_graph = false;
  }).on('mousemove', function(event) {

    dmx = event.originalEvent.movementX;
    dmy = event.originalEvent.movementY;

    return;
  }).on('keydown', function (event) {
    var key = event.keyCode;
    if (key === TAB) {
      event.preventDefault();
      event.stopPropagation();
    perspective_camera = !perspective_camera;
    if (perspective_camera) {
      camera.toPerspective();
    }
    else {
      camera.toOrthographic();
    }
    } else if (key === W) {
      keys.W = true;
    } else if (key === S) {
            keys.S = true;
    } if (key === A) {
            keys.A = true;
    } else if (key === D) {
              keys.D = true;
    }
  }).on('keyup', function(event) {
    var key = event.keyCode;
    if (key === W) {
      keys.W = false;
    } else if (key === S) {
            keys.S = false;
    } if (key === A) {
            keys.A = false;
    } else if (key === D) {
              keys.D = false;
    } else if (key === ESC) {
      camera.reset();
    }
  });

	$('#layout').click(function() {
    if(graph === undefined) {
      alert("no diagram chosen!");
      return;
    }
    display_graph(graph, scene, camera);
  });

  $('#files').change(
  function(e) {
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.onload = (function(readFile) {
    return function(e) {
      graph = reader.result;
    };
  })(file);
  reader.readAsBinaryString(file);
  });

});