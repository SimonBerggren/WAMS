var Input = function () {

	// touch

	var tx = 0;					// current touch x
	var ty = 0;					// current touch y
	var dtx = 0;				// delta touch x
	var dty = 0;				// delta touch y
	var otx = 0;				// old touch x (from previous update)
	var oty = 0;				// old touch y (from previous update)

	// mouse

	var mx = 0;					// current mouse x
	var my = 0;					// current mouse y
	var dmx = 0;				// delta mouse x
	var dmy = 0;				// delta mouse y
	var omx = 0;				// old mouse x (from previous update)
	var omy = 0;				// old mouse y (from previous update)
	var right_mouse = false;	// right mouse button
	var left_mouse = false;		// left mouse button
	
	var rect = undefined;	// area where input moves

	// keyboard

	const NUM_KEYS = 256 ;	// number of supported input characters

	var keys_down = [];			// keys pressed every update
	var keys_clicked = [];		// key codes for clicked keys

	// init all keys to false (not pressed)
	for (var i = 0; i < NUM_KEYS; ++i)
    	keys_down[i] = keys_clicked[i] = false;

    var setTouch = function(x, y) {

		tx = x;
		ty = y;

		dtx = otx - tx;
		dty = oty - ty;

		otx = tx;
		oty = ty;

    };

    var getTouch = function() {
    	return new THREE.Vector2(tx, ty);
    };

    var getTouchDelta = function() {
    	return new THREE.Vector2(dtx, dty);
    };

	// get mouse x position
	var getTouchX = function () { 
		return tx; 
	};

	// get mouse y position
	var getTouchY = function () { 
		return ty; 
	};

	// transform mouse position so that 0,0 is in center
	var getTouchCenterized = function () {
		return new THREE.Vector2(
			( tx / rect.width ) * 2 - 1, 
		  -	( ty / rect.height ) * 2 + 1);
	};

    // update mouse position and mouse delta position
	var setMouse = function (x, y) {
		mx = x;
		my = y;

		dmx = omx - mx;
		dmy = omy - my;

		omx = mx;
		omy = my;
	};

	// get mouse position
	var getMouse = function () {
		return new THREE.Vector2(mx, my);
	};

	// get mouse delta position
	var getMouseDelta = function () {
		return new THREE.Vector2(dmx, dmy);	
	};

	// get mouse x position
	var getMouseX = function () { 
		return mx; 
	};

	// get mouse y position
	var getMouseY = function () { 
		return my; 
	};

	// transform mouse position so that 0,0 is in center
	var getMouseCenterized = function () {
		return new THREE.Vector2(
			( mx / rect.width ) * 2 - 1, 
		  -	( my / rect.height ) * 2 + 1);
	};

	// is left mouse button down?
	var isLeftMouseDown = function () {
		return left_mouse;
	}

	// is right mouse button down?
	var isRightMouseDown = function () {
		return right_mouse;
	}

	// is key pressed?
	var isKeyDown = function (key) {
		return keys_down[key.toUpperCase().charCodeAt(0)];
	};

	// call this at the end of each update
	// resets clicked keys and mouse delta position
	var reset = function () {
		for (var i = 0; i < NUM_KEYS; ++i)
    		keys_clicked[i] = false;

    	dmx = dmy = 0;
	};

	// called when mouse moves over canvas
	var mouseMove = function (event) {
    	rect = event.target.getBoundingClientRect();
    	var x = event.clientX - rect.left;
    	var y = event.clientY - rect.top;
    	setMouse(x, y);
	};

	var touchDown = function (event) {
		if (event.originalEvent.changedTouches.length == 1) {
    		rect = event.target.getBoundingClientRect();
    		var x = event.originalEvent.changedTouches[0].clientX - rect.left;
    		var y = event.originalEvent.changedTouches[0].clientY - rect.top;
    		setTouch(x, y);
    	}
	};

	// called when a mouse button is pressed
	var mouseDown = function (event) {
		mouseMove(event);
		if (event.button == 0)
			left_mouse = true;
		else if (event.button == 2)
			right_mouse = true;
	};

	// called when a mouse button is released
	var mouseUp = function (event) {
		mouseMove(event);
		if (event.button == 0)
			left_mouse = false;
		else if (event.button == 2)
			right_mouse = false;
	};

	// updates key to be pressed
	var keyDown = function (event) {
		keys_down[event.keyCode] = true;
	};

	// updates key to be released
	var keyUp = function (event) {
		keys_down[event.keyCode] = false;
	};

	// hook up mouse events

	$('#glcontainer').on('mousedown', mouseDown);
	$('#glcontainer').on('touchstart', touchDown);
	$(document).on('mouseup', mouseUp);
	$(document).on('mousemove', mouseMove);

	// hook up key events

	$(document).on('keydown', keyDown);
	$(document).on('keyup', keyUp);

	// return public functions and variables
	return {
		setMouse: setMouse,
		getMouse: getMouse,
		getMouseX, getMouseX,
		getMouseY, getMouseY,
		getMouseCenterized: getMouseCenterized,
		getTouchCenterized: getTouchCenterized,
		isKeyDown: isKeyDown,
		reset: reset
	};
};