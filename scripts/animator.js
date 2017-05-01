var Animator = function () {

	var model = undefined;
	var animation = undefined;
	var playing_animation = false;
	var looping = true;
	var looping_bounce = false;
	var animation_backwards = false;
	var animated_objects = [];
	var animated_object_names = [];
	var frame = 0;
	var delta = 0;

  	var addAnimation = function (m, a) {
  		model = m;
  		animation = a;

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
      	});

      	animated_objects = [];
      	loop_children(scene, function(child) {
          for (var i = 0; i < animated_object_names.length; ++i)
            if (child.name.id === animated_object_names[i]) {
                animated_objects.push(child);
                animated_object_names.splice(i, 1);
      	      break;
      	  }
      	});

      	//slider.setAttribute("max", animation.time[animation.time.length - 1]);
      	//slider.refresh();
      	//slider.enable();
      	frame = delta = 0;
  	};

	var update = function (deltaTime) {
    if (animation === undefined || model === undefined)
      return;
    
		if (playing_animation) {
      if (frame < animation.time.length) {
        for (var i = 0; i < animated_objects.length; ++i) {
          var obj = animated_objects[i];
          var name = obj.name.id;
          var m = JSON.parse(animation[name][frame]);
          obj.matrixAutoUpdate = false;
          obj.matrix.elements.set(m);
        }; 
      }

      delta+=deltaTime;
      while (animation.time[frame] < delta)
        ++frame;

      if (frame >= animation.time.length - 1)
        if (looping) {
            frame = delta = 0;
          }
        } else {  // looping
          playing_animation = false;
        
          //slider.setValue(cl);
    } // playing animation 
	};

	var play = function () {
		playing_animation = true;
    console.log("play");
	};

	var pause = function () {
		playing_animation = false;
	};

	var stop = function () {
		playing_animation = false;
		frame = delta = 0;
    slider.setValue(cc = cl = 0);
    console.log("stop");
	};

  $('#looping').click( function(e) {
    looping = e.target.checked;
    if (!looping && looping_bounce)
      document.getElementById("bouncing").click();
  });

  

  playButton.onclick = function() {
      play();
  };
  pauseButton.onclick = function() {
      pause();
  };
  stopButton.onclick = function() {
      stop();
  };  

	return {
		addAnimation, addAnimation,
		update: update,
		play: play,
		pause: pause,
		stop: stop
	};
};