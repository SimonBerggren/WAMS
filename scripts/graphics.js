(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();
(function(){keyCode=function(a){return Math.max(b,Math.min(c,a));}})();

var slider = new Slider('#animation-slider', { min:0, max:1, });

slider.disable();

var newId = 100;
var newEdgeId = 100;
var newPortId = 100;
var collidedPort1;
var collidedPort2;

var recalc = false;

$(function() {
  var displaying_graph = false;  
  var picked_object = undefined;
  var graph = undefined;
  var parsed_graph = undefined;
  var model = undefined;

  input = new Input();
  scene = new THREE.Scene();
  animator = new Animator();

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
  directionalLight.position.set(0,0,10);
  directionalLight.name={name:"important"};
  scene.add(directionalLight);
  
  var light = new THREE.AmbientLight( "white", 0.5 ); // soft white light
  light.name={name:"important"};
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
  object_controls.name={name:"important"};
  scene.add(object_controls);

  var clock = new THREE.Clock();

  function render() {
    requestAnimationFrame(render)
    object_controls.update();
    var delta = clock.getDelta();

    animator.update(delta);

    if (picked_object !== undefined && picked_object.userData !== undefined) {
        var collided = false;
      for (var i = 0; i < picked_object.userData.length; ++i) {
        picked_object.userData[i].setFromObject(picked_object.children[i+1], picked_object);
          for (var j = 0; j < bounding_boxes.length; ++j)
            if (picked_object.userData[i] !== bounding_boxes[j]) {
              var obj1 = picked_object.userData[i].userData;
              var obj2 = bounding_boxes[j].userData;
              if (picked_object.userData[i].intersectsBox(bounding_boxes[j])) {
                  //obj1.scale.set(2,2,2);
                  //obj2.scale.set(2,2,2);
                  collided = true;
                  
                  console.log("Port collision detected! Release to recalculate!");
                  collidedPort1 = obj1;
                  collidedPort2 = obj2;
                } else {

                  //obj1.scale.set(1,1,1);
                  //obj2.scale.set(1,1,1);
                }
            }
        }
        if (collided)
          recalc = true;
    }

    renderer.render(scene, camera);
  }

  $('#glcontainer').on('mousedown', function(event) {

    var raycaster = new THREE.Raycaster();
    camera.updateProjectionMatrix();
    raycaster.setFromCamera(input.getMouseCenterized(), camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    for (var i = 0; i < intersects.length; ++i) {
      if (intersects[i].object.name.name === "pickable") {
        picked_object = intersects[i].object;
        
        while(picked_object.parent !== undefined && picked_object.parent.type !== "Scene")
          picked_object = picked_object.parent;

        object_controls.attach(picked_object);
        

        break;
      }
    }
  }).on('touchstart', function(event) {
    
    // TODO: IMPLEMENT MOBILE DEVICE
      
  }).on('touchmove', function(event) {

    // TODO: IMPLEMENT MOBILE DEVICE

  }).on('mousemove', function(event) {
    

  }).on('mouseup', function() {
    if (recalc) {
      
      recalc = false;
      
      
      parsed_graph.edges.push({
        id:collidedPort1.id,
        source:collidedPort1.source,
        sourcePort:collidedPort1.sourcePort,
        target:collidedPort2.source,
        targetPort:collidedPort2.sourcePort
      });
      var pin = {
        class:"Pin",
        height:3,
        id:collidedPort1.sourcePort,
        //properties:{"de.cau.cs.kieler.portSide":"WEST"},
        with: 3
      }
      //var pin2 = pin;
      //pin2.properties = {"de.cau.cs.kieler.portSide":"EAST"};
      parsed_graph.children.push({
        class:picked_object.name.class,
        height:30,
        id:collidedPort1.source,
        ports:[pin],
        width:30
      });
      clearScene();
      object_controls.detach();
      picked_object = undefined;
      recalc = false;
      calculate_graph(JSON.stringify(parsed_graph));
    }
  }).append(renderer.domElement);

  
  render();

  $(document).on('keyup', function(event) {
    if (event.keyCode == 86) // V
        if (picked_object !== undefined) {
          
            var copy = picked_object.userData;
            picked_object.userData = {};
            var c = picked_object.clone();
            picked_object.userData = copy;
            c.position.y += 10;
            c.position.x += 10;

            c.userData = [];
            for (var i = 0; i < copy.length; ++i) {
              var box = new THREE.Box3().setFromObject(c.children[i + 1]);
              box.userData={
                id:"id" + newEdgeId++,
                source:c.name.id[0] + newId++,
                sourcePort:c.name.id[0] + (newId-1) + newPortId++,
                target:null,
                targetPort:null
              };
              c.userData.push(box);
            }
            
            scene.add(c);
            picked_object = c;
            object_controls.attach(c);
        }
  })

  $('#graph').change( function(e) {
  var file = e.target.files[0];
    if (file !== undefined) {
      fileReader.onload = function(readFile) {
          graph = fileReader.result;
          parsed_graph = JSON.parse(graph);
          
      };
      fileReader.readAsBinaryString(file);
      $(document).find('#calculate').removeClass('disabled');
      $(document).find('#display').removeClass('disabled');
    }
  });

	$('#calculate').click(function() {
    if (graph !== undefined) { 
      displaying_graph = true;
      calculate_graph(graph);
    } 
    else
      alert("no graph chosen!");
  });

$('#display').click(function(event) {
    if (graph !== undefined) { 
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