(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();
(function(){keyCode=function(a){return Math.max(b,Math.min(c,a));}})();

var slider = new Slider('#animation-slider', {
  formatter: function(value) {
    return value;
  },
  min:0,
  max:1,
});

slider.disable();

$(function() {
  $(document).find('.animation-controls').addClass('disabled');
  $(document).find('#browse-animation').addClass('disabled');
  window.addEventListener('resize', onWindowResize, false);

  var perspective_camera = true;
  var leftmousedown_graph = false;
  var rightmousedown_graph = false;
  var picked_object = undefined;
  var displaying_graph = false;
  var playing_animation = false;
  var animation = undefined;
  var looping = false;
  var looping_bounce = false;
  var animation_backwards = false;
  var animated_objects = [];
  var animated_object_names = [];
  var graph;
  var model;
  var animation_controls_enabled = false;
  var _keys = [];
  for (var i = 0; i < 256; ++i)
    _keys[i] = false;

    var W = 87;
    var A = 65;
    var S = 83;
    var D = 68;
    var Q = 81;
    var E = 69;
    var R = 82;
    var TAB = 9;
    var ESC = 27;
    var CTRL = 17;
    var SHIFT = 19;
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

  camera2 = new THREE.PerspectiveCamera( 60, w / h, 1, 1000 );
  camera2.position.z = 500;

  controls2 = new THREE.OrbitControls( camera2, renderer.domElement );
  controls2.addEventListener( 'change', function() { renderer.render(scene, camera2); } ); 

  CAMERA_OBJ = controls.getObject();
  CAMERA_OBJ2 = controls.getObject2();
  CONTROLS = controls;
  scene.add (CAMERA_OBJ);
  CAMERA_OBJ.position.set(0,0,200);
  CAMERA_OBJ2.position.set(0,0,0);
  camera.position.set(0,0,0);
  var clock;
  control = new THREE.TransformControls( camera2, renderer.domElement );

  //control.addEventListener( 'change', render );
  control.setMode("translate");
  scene.add(control);
  var mx = 0;
  var my = 0;
  var omx = 0;
  var omy = 0;
  var dmx = 0;
  var dmy = 0;
  var cl = 0;
  var cc = 0;
  function render() {
    requestAnimationFrame(render)
    control.update();
    var delta = clock.getDelta();
    if (leftmousedown_graph) {
        //camera.position.x -= dmx * 5;
        //camera.position.y += dmy * 5;
    } else if (rightmousedown_graph && !_keys[SHIFT]) {
      controls.movementSpeed = 0.33;
      var x = dmx / 10;
      var y =  dmy / 10;
      var limit = 1000;
      x = Math.clamp(x, -limit, limit);
      y = Math.clamp(y, -limit, limit);
      controls.update( x, y );
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
    }
    dmx = dmy = 0;

      if (playing_animation) {
        if ((animation_backwards && cc >= 0) || (!animation_backwards && cc < animation.time.length)) {
          for (var i = 0; i < animated_objects.length; ++i) {
            var obj = animated_objects[i];
            var name = obj.name;
            var m = JSON.parse(animation[name][cc]);
            obj.matrixAutoUpdate = false;
            obj.matrix.elements.set(m);
          }; 
        }

        if (animation_backwards) {
          cl-=delta;
          while (animation.time[cc] > cl)
            --cc;
        } else {
          cl+=delta;
          while (animation.time[cc] < cl)
            ++cc;
        }

        if ((animation_backwards && cc <= 0) || (!animation_backwards && cc >= animation.time.length - 1)) 
          if (looping) {
            if (looping_bounce) {
              animation_backwards = !animation_backwards;
              cc = animation_backwards ? animation.time.length - 1 : 0;
              cl = animation.time[cc];
            } else {
              if (animation_backwards)
              animation_backwards = false;
              cc = 0;
              cl = 0;  
            }
          } else {
            playing_animation = false;
          }
          slider.setValue(cl);
      }

    renderer.render(scene, camera2);
  }
  var saved_mousex = undefined;
  var saved_mousey = undefined;
  $('#glcontainer').on('mousedown', function(event) {
    if(event.button == 0) {
        leftmousedown_graph = true;
    var mouse = new THREE.Vector2();
    mouse.x = ( mx / rect.width ) * 2 - 1;
    mouse.y = - ( my / rect.height ) * 2 + 1;
    var raycaster = new THREE.Raycaster();
    camera2.updateProjectionMatrix();
    raycaster.setFromCamera(mouse, camera2);
    var intersects = raycaster.intersectObjects(scene.children, true);
    control.detach();
    picked_object = undefined;
    for (var i = 0; i < intersects.length; ++i) {
      console.log(intersects);
      if (intersects[0].object.name === "pickable") {
      control.detach();

        picked_object = intersects[0].object;
        
        while(picked_object.parent !== undefined && picked_object.parent.type !== "Scene")
          picked_object = picked_object.parent;

        control.attach(picked_object);
        break;
      }
    }

    }
    else if (event.button == 2) {
      if (!rightmousedown_graph) 
        ;
    rightmousedown_graph = true;
    }
  }).bind('DOMMouseScroll mousewheel', function(event) {
    camera.moveBwd(event.originalEvent.wheelDeltaY);
  }).append(renderer.domElement);

  clock = new THREE.Clock();
  render();

  $(document).on('contextmenu', function(event) {
    event.preventDefault();
  }).on('mouseup', function(event) {
    leftmousedown_graph = false;
    rightmousedown_graph = false;
  }).on('mousemove', function(event) {

    mx = 0;
    my = 0;
    
    rect = event.target.getBoundingClientRect();
    mx = event.clientX - rect.left;
    my = event.clientY - rect.top;
    if (leftmousedown_graph) {
      if (picked_object !== undefined) {
        //picked_object.position.x -= dmx * 3;
        //picked_object.position.y += dmy * 3;
      }
    }
    else if (displaying_graph) {

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

    if (_keys[SHIFT]) {
      if (_keys[W])
        control.setMode("translate");
      else if (_keys[E])
        control.setMode("rotate");
      else if (_keys[R])
        control.setMode("scale");
      else if (_keys[Q])
        control.setSpace( control.space === "local" ? "world" : "local" );
    }
  }).on('keyup', function(event) {
    var key = event.keyCode;
    _keys[key] = false; 
    if (key === ESC)
      camera.reset();
  });

	$('#calculate').click(function() {
    if(graph === undefined) {
      alert("no graph chosen!");
      return;
    }
    displaying_graph = true;
    
    calculate_graph(graph, scene, camera);
  });

$('#display').click(function(event) {
    if(graph === undefined) {
      alert("no graph chosen!");
      return;
    }
    displaying_graph = true;
    
    display_graph(graph, scene, camera, true);
  });

var file_name;
$('#animate-model').click(function(event) {
    if(model === undefined || animation === undefined) {
      alert("no model or animation chosen!");
      return;
    }
    
    playing_animation = true;

     

  });

  $('#file').change( function(e) {
  var file = e.target.files[0];
  file_name = file.name.split(".")[0];
  var reader = new FileReader();
  reader.onload = function(readFile) {
      graph = reader.result;
  };
  reader.readAsBinaryString(file);
  });

  $('#animation').change( function(e) {
    var reader = new FileReader();
    var file = e.target.files[0];
    reader.onload = function(readFile) {
      animation = JSON.parse(reader.result);
      $(document).find('.animation-controls').removeClass('disabled');

      var loop_children = function(parent, func) {
        for (var i = 0; i < parent.children.length; ++i) {
          var child = parent.children[i];
          if (child.children !== undefined && child.children.length > 0)
            loop_children(child, func);
          else
            func(child);
        }
      };

      animated_object_names = [];
  loop_children(model.object, function(child) {
    animated_object_names.push(child.name);
  })
  animated_objects = [];
  loop_children(scene, function(child) {
    for (var i = 0; i < animated_object_names.length; ++i)
      if (child.name === animated_object_names[i]){
        animated_objects.push(child);
        animated_object_names.splice(i, 1);
        break;
      }
    });

  slider.setAttribute("max", animation.time[animation.time.length - 1]);
  slider.refresh();
  slider.enable();
  cc = cl = 0;
  slider.on("slide", function(value) {
  //   playing_animation = false;
  // cl = value;
  // cc = (cl / animation.time[animation.time.length - 1]) * animation.time.length - 1;
  // for (var i = 0; i < animated_objects.length; ++i) {
  //   var obj = animated_objects[i];
  //   var name = obj.name;
  //   var m = JSON.parse(animation[name][cc]);
  //   obj.matrixAutoUpdate = false;
  //   obj.matrix.elements.set(m);
  //   }; 
  });

    };
    reader.readAsBinaryString(file);
  });

  $('#model').change( function(e) {
    var reader = new FileReader();
    var file = e.target.files[0];
    reader.onload = function(readFile) {
      model = JSON.parse(reader.result);
      displaying_graph = false;
      
      loadModel(model);
      camera.setOriginalPosition({x:0,y:0,z:200});

      $(document).find('#browse-animation').removeClass('disabled');
    };
    reader.readAsBinaryString(file);
  });

  $('#looping').click( function(e) {
    looping = e.target.checked;
    if (!looping && looping_bounce)
      document.getElementById("bouncing").click();
  });

  $('#bouncing').click( function(e) {
    looping_bounce = e.target.checked;
    if (!looping && looping_bounce)
      document.getElementById("looping").click();
  });

  $('#play').click( function(e) {
    playing_animation = true;
  });

  $('#pause').click( function(e) {
    playing_animation = false;
  });

  $('#stop').click( function(e) {
    playing_animation = false;
    slider.setValue(cc = cl = 0);
  });

  $('#clear').click( function(e) {
    clearScene();
    scene.add(control);
  });

    function onWindowResize() {
        camera.aspect = window.innerWidth / 600;
        camera.width = window.innerWidth;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, 600 );

        render();

 }

});