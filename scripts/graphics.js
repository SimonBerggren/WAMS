function Text(x1, y1, x2, y2, string, lineColor, level, translate, scale) {
    if (translate === undefined) {
      translate = [0,0,0]
    } if (scale === undefined) {
      scale = [1,1,1]
    }
          textCanvas = document.createElement("canvas");
          textContext = textCanvas.getContext("2d");
          textCanvas.width = textContext.width = 8000;
          textCanvas.height = textContext.height = 2000;
          var col= "#"+new THREE.Color(lineColor[0], lineColor[1], lineColor[2]).getHexString();
          textContext.fillStyle = col;
          var text = string;
          var textDimensions;
          var fontSize = 4;
          do {
              textContext.font = ++fontSize + "px Arial";
              textDimensions = textContext.measureText(text);
          } while (fontSize < textContext.height && textDimensions.width < textContext.width);
          textContext.textAlign = "center";
          textContext.textBaseline = "middle";
          textContext.fillText(text, textCanvas.width/2, textCanvas.height/2);
          textTexture = new THREE.Texture(textCanvas);
          textTexture.needsUpdate = true;
          material = new THREE.MeshPhongMaterial({map: textTexture, side: THREE.DoubleSide});
          material.transparent = true;
          geometry = new THREE.PlaneBufferGeometry(x2-x1, y2-y1);
          mesh = new THREE.Mesh(geometry, material);
          mesh.position.set((x1+x2)/2, (y1+y2)/2, level*delta*scale[0]);
          mesh.userData.origColor = 0x1c6cc8;
          mesh.userData.pickingAllowed = true;
          calculateBoundingBox(mesh);
    return mesh;
}



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

  var omx = 0;
  var omy = 0;
  var dmx = 0;
  var dmy = 0;

  function render() {
    if (leftmousedown_graph) {
        camera.position.x -= dmx / camera.zoom;
        camera.position.y += dmy / camera.zoom;
    } else if (rightmousedown_graph) {
      camera.rotation.y -= dmx / 750;
      camera.rotation.x  -= dmy / 750;
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

    requestAnimationFrame(render)
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
  render();
  $(document).on('contextmenu', function(event) {
    event.preventDefault();
  }).on('mouseup', function() {
    leftmousedown_graph = false;
    rightmousedown_graph = false;
  }).on('mousemove', function(event) {
    var mx = event.clientX;
    var my = event.clientY;
    
    dmx = mx - omx;
    dmy = my - omy;
    omx = mx;
    omy = my;
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