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
    if (cc >= animation.time.length - 1)
        cc = cl = 0;
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