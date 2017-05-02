// Animator is used for updating models with new matrices from animation files
// Use addAnimation

var Animator = function () {

    var model = undefined;
    var animation = undefined;
    var playing_animation = false;
    var looping = true;
    var animated_objects = [];
    var animated_object_names = [];
    var frame = 0;
    var delta = 0;

    var addAnimation = function (_model, _animation) {

        model = _model;
        animation = _animation;
        frame = delta = 0;

        // helper function, used to traverse all children on all levels, of any given object
        // then executes _func with child as parameter
        var loop_children = function(parent, func) {
            for (var i = 0; i < parent.children.length; ++i) {
                var child = parent.children[i];
                if (child.children !== undefined && child.children.length > 0)
                    loop_children(child, func);
                else
                    func(child);
                }
        };

        // extract all unique parts of a model
        animated_object_names = [];
        loop_children(model.object, function(child) {
                animated_object_names.push(child.name);
            });


        // match all parts to objects in scene, so we know what to animate
        animated_objects = [];
        loop_children(scene, function(child) {
                for (var i = 0; i < animated_object_names.length; ++i) {
                    if (child.name === animated_object_names[i]) {
                        animated_objects.push(child);
                        animated_object_names.splice(i, 1);
                    break;
                    }
                }
        });
    };

    // called every frame
    var update = function (deltaTime) {

        if (animation === undefined || model === undefined)
            return;

        if (playing_animation) {

            if (frame < animation.time.length) {

                for (var i = 0; i < animated_objects.length; ++i) {

                    var obj = animated_objects[i];
                    var name = obj.name;
                    var anim = animation[name];

                        var m = JSON.parse(anim[frame]);
                        obj.matrixAutoUpdate = false;
                        obj.matrix.elements.set(m);

                }; 
            }

        // time between frames might take longer than the difference in the animation file
        // in that case, compensate so we take a matrix matching current time
        delta+=deltaTime;
        while (animation.time[frame] < delta)
            ++frame;

        // reached end of animation
        if (frame >= animation.time.length - 1)
            if (looping) {
                frame = delta = 0;
            }
        } else {  // looping
            playing_animation = false;

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

    return {
        addAnimation, addAnimation,
        update: update,
        play: play,
        pause: pause,
        stop: stop
    };
};