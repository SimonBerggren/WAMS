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
  var scene = new THREE.Scene();
  var w = window.innerWidth;
  var h = 600;

  var renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.setClearColor( "white", 1 );
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
    } if (keys.Q) {
            camera.RollLeft(0.02);
    } else if (keys.E) {
            camera.RollRight(0.02);
    }
      dmx = dmy = 0;
    renderer.render(scene, camera);
  }

  var map = new THREE.TextureLoader().load( "static/icons/IdealOpAmp3Pin.svg", function(obj) {
  var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff} ); 
  var sprite = new THREE.Sprite( material ); 
  
  sprite.position.set(0,0,400);
  sprite.scale.set(100,100,100);
  scene.add( sprite );
} ); 


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

    var mx = 0;
    var my = 0;

    if (event.target.tagName === "CANVAS") {
      var rect = event.target.getBoundingClientRect();
      mx = event.clientX - rect.left,
      my = event.clientY - rect.top
    };

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
    calculate_graph(graph, scene, camera);
  });

$('#display').click(function(event) {
    if(graph === undefined) {
      alert("no diagram chosen!");
      return;
    }
    display_graph(graph, scene, camera, true);
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