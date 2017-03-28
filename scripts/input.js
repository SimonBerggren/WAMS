var Input = function () {

	// mouse

	var mx = 0;					// current mouse x
	var my = 0;					// current mouse y
	var dmx = 0;				// delta mouse x
	var dmy = 0;				// delta mouse y
	var omx = 0;				// old mouse x (from previous update)
	var omy = 0;				// old mouse y (from previous update)
	var right_mouse = false;	// right mouse button
	var left_mouse = false;		// left mouse button
	var mouse_rect = undefined;	// area where mouse moves

	// keyboard

	const NUM_KEYS = 256 ;	// number of supported input characters

	var keys_down = [];			// keys pressed every update
	var keys_clicked = [];		// key codes for clicked keys

	// init all keys to false (not pressed)
	for (var i = 0; i < NUM_KEYS; ++i)
    	keys_down[i] = keys_clicked[i] = false;

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
		return mx; 
	};

	// transform mouse position so that 0,0 is in center
	var getMouseCenterized = function () {
		return new THREE.Vector2(
			( mx / mouse_rect.width ) * 2 - 1, 
		  -	( my / mouse_rect.height ) * 2 + 1);
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
    	mouse_rect = event.target.getBoundingClientRect();
    	var x = event.clientX - mouse_rect.left;
    	var y = event.clientY - mouse_rect.top;
    	setMouse(x, y);
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
		isKeyDown: isKeyDown,
		reset: reset
	};
};