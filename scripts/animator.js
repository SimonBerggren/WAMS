var Animator = function () {

	var model = model;
	var animation = animation;
	var playing_animation = false;
	var looping = false;
  	var looping_bounce = false;
  	var animation_backwards = false;
  	var animated_objects = [];
  	var animated_object_names = [];
  	var frame = 0;
  	var delta = 0;

  	var addAnimation = function (m, a) {
  		model = m;
  		animation = a;

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
      	});

      	animated_objects = [];
      	loop_children(scene, function(child) {
      	  for (var i = 0; i < animated_object_names.length; ++i)
      	    if (child.name === animated_object_names[i]) {
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
		if (playing_animation) {
      if ((animation_backwards && frame >= 0) || (!animation_backwards && frame < animation.time.length)) {
        for (var i = 0; i < animated_objects.length; ++i) {
          var obj = animated_objects[i];
          var name = obj.name;
          var m = JSON.parse(animation[name][frame]);
          obj.matrixAutoUpdate = false;
          obj.matrix.elements.set(m);
        }; 
      }

      if (animation_backwards) {
        delta-=deltaTime;
        while (animation.time[frame] > delta)
          --frame;
      } else {
        delta+=deltaTime;
        while (animation.time[frame] < delta)
          ++frame;
      }

      if ((animation_backwards && frame <= 0) || (!animation_backwards && frame >= animation.time.length - 1)) 
        if (looping) {
          if (looping_bounce) {
            animation_backwards = !animation_backwards;
            frame = animation_backwards ? animation.time.length - 1 : 0;
            delta = animation.time[frame];
          } else {
            if (animation_backwards)
            animation_backwards = false;
            frame = delta = 0;
          }
        } else {  // looping
          playing_animation = false;
        }
          //slider.setValue(cl);
    } // playing animation 
	};

	var play = function () {
		playing_animation = true;
	};

	var pause = function () {
		playing_animation = false;
	};

	var stop = function () {
		playing_animation = false;
		frame = delta = 0;
	};

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

	return {
		addAnimation, addAnimation,
		update: update,
		play: play,
		pause: pause,
		stop: stop
	};
};