(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();
(function(){keyCode=function(a){return Math.max(b,Math.min(c,a));}})();

var slider = new Slider('#animation-slider', { min:0, max:1, });

slider.disable();

var integer = 0;

$(function() {
  var picked_object = undefined;
  var displaying_graph = false;  
  var graph;
  var model;
  var animation_controls_enabled = false;

  input = new Input();
  scene = new THREE.Scene();
  animator = new Animator();

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
  directionalLight.position.set(0,0,10);
  directionalLight.name="important";
  scene.add(directionalLight);
  
  var light = new THREE.AmbientLight( "white", 0.5 ); // soft white light
  light.name="important";
  scene.add(light);

  var w = window.innerWidth;
  var h = 600;
  
  var renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.setClearColor( "gray", 1 );
  renderer.setSize(w, h);

  camera = new THREE.PerspectiveCamera( 50, w / h, 1, 1500 );
  camera.position.z = 500;
  camera_controls = new THREE.OrbitControls(camera, renderer.domElement);
  camera_controls.addEventListener('change', function() { renderer.render(scene, camera); }); 
  object_controls = new THREE.TransformControls(camera, camera_controls, renderer.domElement);  
  object_controls.name="important";

  var clock = new THREE.Clock();
  scene.add(object_controls);

  function render() {
    requestAnimationFrame(render)
    object_controls.update();
    var delta = clock.getDelta();

    animator.update(delta);

    if (picked_object !== undefined && picked_object.userData !== undefined) {
      for (var i = 0; i < picked_object.userData.length; ++i) {
        picked_object.userData[i].setFromObject(picked_object.children[i+1], picked_object);        
    for (var j = 0; j < bounding_boxes.length; ++j)
      if (picked_object.userData[i] !== bounding_boxes[j]) {
          var obj1 = picked_object.userData[i].parent;
          var obj2 = bounding_boxes[j].parent;
        if (picked_object.userData[i].intersectsBox(bounding_boxes[j])) {
          obj1.scale.set(2,2,2);
          obj2.scale.set(2,2,2);
        } else {
          obj1.scale.set(1,1,1);
          obj2.scale.set(1,1,1);
        }
      }
    }
      }

    renderer.render(scene, camera);
  }

  $('#glcontainer').on('mousedown', function(event) {

    var raycaster = new THREE.Raycaster();
    camera.updateProjectionMatrix();
    raycaster.setFromCamera(input.getMouseCenterized(), camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    for (var i = 0; i < intersects.length; ++i) {
      if (intersects[i].object.name === "pickable") {
        picked_object = intersects[i].object;
        
        while(picked_object.parent !== undefined && picked_object.parent.type !== "Scene")
          picked_object = picked_object.parent;

        object_controls.attach(picked_object);

        console.log(picked_object.children);
        
        break;
      }
    }
  }).on('touchstart', function(event) {
    
    // TODO: IMPLEMENT MOBILE DEVICE
      
  }).on('touchmove', function(event) {

    // TODO: IMPLEMENT MOBILE DEVICE

  }).on('mousemove', function(event) {
    

  }).append(renderer.domElement);

  
  render();

  function hasGraph() {
    return graph === undefined;
  };

  $('#graph').change( function(e) {
  var file = e.target.files[0];
  if (file !== undefined) {
    fileReader.onload = function(readFile) {
        graph = fileReader.result;
    };
    fileReader.readAsBinaryString(file);
    $(document).find('#calculate').removeClass('disabled');
    $(document).find('#display').removeClass('disabled');
  }
  });

	$('#calculate').click(function() {
    if (hasGraph) { 
      displaying_graph = true;
      calculate_graph(graph);
    } 
    else
      alert("no graph chosen!");
  });

$('#display').click(function(event) {
    if (hasGraph) { 
      displaying_graph = true;
      display_graph(graph);
    } 
    else
      alert("no graph chosen!");
  });

  $('#model').change( function(e) {
    var file = e.target.files[0];
    if (file !== undefined) {
      fileReader.onload = function(readFile) {
          model = JSON.parse(fileReader.result);
          displaying_graph = false;
          
          addModel(model);
  
        $(document).find('#browse-animation').removeClass('disabled');
      };
      fileReader.readAsBinaryString(file);
    }
  });

  $('#animation').change( function(e) {
    var file = e.target.files[0];
    if (file !== undefined) {
      fileReader.onload = function(readFile) {
        animation = JSON.parse(fileReader.result);
        animator.addAnimation(model, animation);
      };
    fileReader.readAsBinaryString(file);
    }
  });

$('#animate-model').click(function(event) {
    if(model === undefined || animation === undefined) {
      alert("no model or animation chosen!");
      return;
    }
    
    playing_animation = true;
  });

  $('#clear').click( function(e) {
    object_controls.detach();
    clearScene();
  });
});