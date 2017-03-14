(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();

$(function() {
  var perspective_camera = true;
  var leftmousedown_graph = false;
  var rightmousedown_graph = false;
  var picked_object = undefined;
  var displaying_graph = false;
  var playing_animation = false;
  var animation = undefined;
  var looping = true;
  var animation_backwards = false;
  var graph;
  var _keys = [];
  for (var i = 0; i < 256; ++i)
    _keys[i] = false;

    var W = 87;
    var A = 65;
    var S = 83;
    var D = 68;
    var Q = 81;
    var E = 69;
    var TAB = 9;
    var ESC = 27;
    scene = new THREE.Scene();
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set(0,0,10);
  var light = new THREE.AmbientLight( 0x2f4f4f ); // soft white light
  directionalLight.name="important";
  scene.add( directionalLight );
  light.name="important";
  scene.add(light);
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
  var cl = 0;
  var cc = 0;
  function render() {
    requestAnimationFrame(render)
    var delta = clock.getDelta();
    if (leftmousedown_graph) {
        //camera.position.x -= dmx * 5;
        //camera.position.y += dmy * 5;
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
    if (_keys[W]) {
      camera.moveFwd(camera_speed);
    } else if (_keys[S]) {
      camera.moveBwd(camera_speed);
    } if (_keys[A]) {
      camera.moveLeft(camera_speed);
    } else if (_keys[D]) {
camera.moveRight(camera_speed);
    } if (_keys[Q]) {
            camera.RollLeft(0.02);
    } else if (_keys[E]) {
            camera.RollRight(0.02);
    }
    dmx = dmy = 0;

      if (playing_animation) {
        if ((animation_backwards && cc >= 0) || cc < animation.time.length) {
          if ((animation_backwards && cl >= 0) || animation.time[cc] < cl) {
            for (var i = scene.children.length - 1; i >= 0; i--) {
              if (scene.children[i] !== undefined && scene.children[i].name === "Group 1")
                if (scene.children[i].children[0] !== undefined && scene.children[i].children[0].type === "Group") {
                  var m1 = JSON.parse(animation.boxBody1[cc]);
                  var m = new THREE.Matrix4();
                  m.set(
                    m1[0], m1[4], m1[8], m1[12],
                    m1[1], m1[5], m1[9], m1[13],
                    m1[2], m1[6], m1[10], m1[14],
                    m1[3], m1[7], m1[11], m1[15]
                    );

                  var obj = scene.children[i].children[0].children[0];
                  obj.matrixAutoUpdate = false;
                  obj.matrix.copy(m);
                  obj.matrixWorldNeedsUpdate = true;
                  obj.updateMatrixWorld();
                  
                  var m2 = JSON.parse(animation.boxBody2[cc]);
                   m.set(
                    m2[0], m2[4], m2[8], m2[12],
                    m2[1], m2[5], m2[9], m2[13],
                    m2[2], m2[6], m2[10], m2[14],
                    m2[3], m2[7], m2[11], m2[15]
                    );
                  
                  var obj2 = scene.children[i].children[0].children[1];
                  obj2.matrixAutoUpdate = false;
                  obj2.matrix.copy(m);
                  obj2.matrixWorldNeedsUpdate = true;
                  obj2.updateMatrixWorld();
                  //scene.children[i].children[0].children[1].matrix.set(JSON.parse(animation.boxBody2[cc]));
                }
            }
          }
          if (animation_backwards) {
            --cc;
            cl-=delta;
          } else {
            ++cc;
            cl+=delta;
          }
        } 

        if ((animation_backwards && cc == 0) || cc == animation.time.length - 1) 
            if (looping) {
          animation_backwards = !animation_backwards;
        } else {
          playing_animation = false;
          cc = 0;
          cl = 0;
        }
      }

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
    if (leftmousedown_graph) {
      if (picked_object !== undefined) {
        picked_object.position.x -= dmx * 3;
        picked_object.position.y += dmy * 3;
      }
    }
    else if (displaying_graph) {
    var mouse = new THREE.Vector2();
    mouse.x = ( mx / rect.width ) * 2 - 1;
    mouse.y = - ( my / rect.height ) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    camera.update();
    raycaster.setFromCamera(mouse, PERSP_CAMERA);
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      if (picked_object !== undefined)
        picked_object.material.color.set( "white" );
      if (intersects[0].object.type !== "Line" && intersects[0].object.name !== "plane") {
        picked_object = intersects[0].object;
        
         if (picked_object.material !== undefined && picked_object.material.color !== undefined) {
      picked_object.material.color.set( 0xff0000 );
    } else {
      console.log(picked_object);
    }
      }
    }
    else if (picked_object !== undefined) {
      if (picked_object.material !== undefined && picked_object.material.color !== undefined) {
        if (picked_object.name === "edge")
          picked_object.material.color.set( "blue" );
        else
          picked_object.material.color.set( "white" );
    } else {
      console.log(picked_object);
    }
      picked_object = undefined;
    }
    }
    dmx = omx - mx;
    dmy = omy - my;

    omx = mx;
    omy = my;

  }).on('keydown', function (event) {
    var key = event.keyCode;
    if (key === TAB) {
      event.preventDefault();
      event.stopPropagation();
    perspective_camera = !perspective_camera;
    if (perspective_camera)
      camera.toPerspective();
    else
      camera.toOrthographic();
    }
    _keys[key] = true;
  }).on('keyup', function(event) {
    var key = event.keyCode;
    _keys[key] = false; 
    if (key === ESC)
      camera.reset();
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
    loadJSON(graph, 0, 0, 0, 0, file_name);
    camera.setOriginalPosition({x:0,y:0,z:200});
  });
$('#animate-model').click(function(event) {
    if(graph === undefined) {
      alert("no model chosen!");
      return;
    }
    displaying_graph = false;
    clearScene();
    loadJSON(graph, 0, 0, 0, 0, file_name);
    camera.setOriginalPosition({x:0,y:0,z:200});
    playing_animation = true;
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
    $('#animation').change(
  function(e) {
  var reader = new FileReader();
    var file = e.target.files[0];
  reader.onload = (function(readFile) {
    return function(e) {
      animation = JSON.parse(reader.result);
    };
  })(file);
  reader.readAsBinaryString(file);
  });

});