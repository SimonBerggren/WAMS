(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();

$(function() {
  var perspective_camera = true;
  var leftmousedown_graph = false;
  var rightmousedown_graph = false;
  var picked_object = undefined;
  var displaying_graph = false;
  var graph;
  var keys = {
    W: false,
    A: false,
    S: false,
    D: false,
    Q: false,
    E: false
  }
  var W = 87;
    var A = 65;
    var S = 83;
    var D = 68;
    var Q = 81;
    var E = 69;
    var TAB = 9;
    var ESC = 27;
    scene = new THREE.Scene();
  var light = new THREE.AmbientLight( "white" ); // soft white light
  light.name="important";
scene.add( light );
  var w = window.innerWidth;
  var h = 600;

  var renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.setClearColor( "white", 1 );
  renderer.setSize(w, h);
  var rect = undefined;

  var minZoom = 0.1;
  var camera = new THREE.CombinedCamera(w/2, h/2,50, 1, 1000, -500, 1000);
  var controls = new THREE.PointerLockControls( camera );

  CAMERA_OBJ = controls.getObject();
  CAMERA_OBJ2 = controls.getObject2();
  CONTROLS = controls;
  scene.add (CAMERA_OBJ);
  CAMERA_OBJ.position.set(0,0,200);
  CAMERA_OBJ2.position.set(0,0,0);
  camera.position.set(0,0,0);
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
      var x = dmx / 10;
      var y =  dmy / 10;
      var limit = 1000;
      x = Math.clamp(x, -limit, limit);
      y = Math.clamp(y, -limit, limit);
      controls.update( x, y );
    }
    var camera_speed = 5;
    if (keys.W) {
      camera.moveFwd(camera_speed);
    } else if (keys.S) {
      camera.moveBwd(camera_speed);
    } if (keys.A) {
      camera.moveLeft(camera_speed);
    } else if (keys.D) {
camera.moveRight(camera_speed);
    } if (keys.Q) {
            camera.RollLeft(0.02);
    } else if (keys.E) {
            camera.RollRight(0.02);
    }
      dmx = dmy = 0;
    renderer.render(scene, camera);
  }
  var saved_mousex = undefined;
  var saved_mousey = undefined;
  $('#glcontainer').on('mousedown', function(event) {

    if(event.button == 0)
        leftmousedown_graph = true;
    else if (event.button == 2) {
      if (!rightmousedown_graph) 
        ;
    rightmousedown_graph = true;
    }
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

    var mx = 0;
    var my = 0;
    
    rect = event.target.getBoundingClientRect();
    mx = event.clientX - rect.left;
    my = event.clientY - rect.top;
    if (displaying_graph) {
    var mouse = new THREE.Vector2();
    mouse.x = ( mx / rect.width ) * 2 - 1;
    mouse.y = - ( my / rect.height ) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    camera.update();
    raycaster.setFromCamera(mouse, PERSP_CAMERA);
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      if (picked_object !== undefined)
        if (picked_object.material.color === undefined) {
          for (var i = 0; i < picked_object.material.materials.length; ++i) {
            picked_object.material.materials[i].set(0xff0000);
          }
    } else {
      picked_object.material.color.set( 0xff0000 );
    }
      if (intersects[0].object.type !== "Line" && intersects[0].object.name !== "plane") {
        picked_object = intersects[0].object;
        
         if (picked_object.material.color === undefined) {
          for (var i = 0; i < picked_object.material.materials.length; ++i) {
            picked_object.material.materials[i].set(0xff0000);
          }
    } else {
      picked_object.material.color.set( 0xff0000 );
    }

      }
    }
    else if (picked_object !== undefined) {
      if (picked_object.material.color === undefined) {
          for (var i = 0; i < picked_object.material.materials.length; ++i) {
            picked_object.material.materials[i].set(0xff0000);
          }
    } else {
      picked_object.material.color.set( 0xff0000 );
    }
      picked_object = undefined;
    }
    }
    dmx = omx - mx;
    dmy = omy - my;

    omx = mx;
    omy = my;

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
    } else if (key === Q) {
              keys.Q = true;
    } else if (key === E) {
              keys.E = true;
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
    } else if (key === Q) {
              keys.Q = false;
    } else if (key === E) {
              keys.E = false;
    } else if (key === ESC) {
      camera.reset();
    }
  });

	$('#calculate').click(function() {
    if(graph === undefined) {
      alert("no diagram chosen!");
      return;
    }
    displaying_graph = true;
    clearScene();
    calculate_graph(graph, scene, camera);
  });

$('#display').click(function(event) {
    if(graph === undefined) {
      alert("no diagram chosen!");
      return;
    }
    displaying_graph = true;
    clearScene();
    display_graph(graph, scene, camera, true);
  });
var file_name;
$('#display-model').click(function(event) {
    if(graph === undefined) {
      alert("no model chosen!");
      return;
    }
    displaying_graph = false;
    clearScene();
    loadJSON(file_name, 0, 0, 0, 0);
    camera.setOriginalPosition({x:0,y:0,z:200});
  });

  $('#files').change(
  function(e) {
  var file = e.target.files[0];
  file_name = file.name.split(".")[0];
  var reader = new FileReader();
  reader.onload = (function(readFile) {
    return function(e) {
      graph = reader.result;
    };
  })(file);
  reader.readAsBinaryString(file);
  });

});