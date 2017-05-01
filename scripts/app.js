// main file, contains initialization, update and render loop

var manualMode = document.getElementById("manual-mode");
var saveButton = document.getElementById("save");

var cloneButton = document.getElementById("clone");
var deleteButton = document.getElementById("delete");
var rotateButton = document.getElementById("rotate90");

var playButton = document.getElementById("play");
var pauseButton = document.getElementById("pause");
var stopButton = document.getElementById("stop");

var controlMode = document.getElementById("2d-control-mode");
var resetCameraButton = document.getElementById("resetCamera");

resetScene = function() {
    model = undefined;
    animation = undefined;
};
var initTouch;

var mouseMoved = false;
var mouseDown = false;

var timeDownUp = null;
var picked_port = undefined;
var matched_port = undefined;
var picked_object = undefined;
var graph = undefined;
var model = undefined;
var port_found = false;

var stats = new Stats();
stats.showPanel( 0 );

if (showingStats)
    document.body.append(stats.dom);

$(function() {

    input = new Input();
    scene = new THREE.Scene();
    animator = new Animator();

    var directionalLight = new THREE.DirectionalLight( directionalLightColor, directionalLightIntensity );
    directionalLight.position.set(directionalLightPosition.x, directionalLightPosition.y, directionalLightPosition.z);
    directionalLight.name={name:"important"};
    scene.add(directionalLight);

var light = new THREE.AmbientLight( ambientLightColor, ambientLightIntensity );
light.name={name:"important"};
scene.add(light);

var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.setClearColor( clearColor, 1 );
renderer.setSize(windowWidth, windowHeight);

camera = new THREE.PerspectiveCamera( camerFieldOfView, windowWidth / windowHeight, cameraFrontClip, cameraBackClip );

camera_controls = new THREE.OrbitControls(camera, renderer.domElement);
camera_controls.addEventListener('change', function() { renderer.render(scene, camera); }); 

object_controls_2d = new THREE.TransformControls2D(camera, camera_controls, renderer.domElement);
object_controls_2d.name={name:"important"};
object_controls_2d.setOnMove(function(){mouseMoved = true;});
scene.add(object_controls_2d);

object_controls_3d = new THREE.TransformControls3D(camera, camera_controls, renderer.domElement);
object_controls_3d.name={name:"important"};
object_controls_3d.setOnMove(function(){mouseMoved = true;});
scene.add(object_controls_3d);

object_controls = object_controls_2d;

var clock = new THREE.Clock();
render();

function render() {
    stats.begin();
    
    object_controls.update();
    var delta = clock.getDelta();

    animator.update(delta);

    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(render);
}

$('#glcontainer').on('mousedown', function(event) {
    mouseDown = true;
}).on('touchstart', function(e) {
    e.preventDefault();
    pointerDown();    
}).on('touchmove', function(e) {
    pointerMove();
}).on('touchend', function(e) {
    pointerUp(true, e.originalEvent)
}).on('mousedown', function(e) {
    e.preventDefault();
    pointerDown();
}).on('mousemove', function(e) {
    pointerMove();
}).on('mouseup', function(e) {
    pointerUp(false);        
}).append(renderer.domElement);

function pointerMove() {
    var timeMove = new Date().getTime();
    timeDownUp += 10;
    if (timeMove > timeDownUp) {
        if (mouseDown) {
            mouseMoved = true;
        }
    } else {
        timeDownUp = null;
        mouseMoved = false;
    }
};

function pointerDown() {
    timeDownUp = new Date().getTime();
    mouseMoved = false;
    mouseDown = true;
};

function pointerUp(touch, event) {
    timeDownUp = new Date().getTime();

    mouseDown = false;
    if (mouseMoved) {
        mouseMoved = false;
        return;
    }
    if (!touch || touch && event.changedTouches.length == 1)
        CheckRaycast(touch);
}

function CheckRaycast(touch) {
    var center = touch ? input.getTouchCenterized() : input.getMouseCenterized();

            var raycaster = new THREE.Raycaster();
            camera.updateProjectionMatrix();
            raycaster.setFromCamera(center, camera);
            var intersects = raycaster.intersectObjects(scene.children, true);
            var raycastHit = false;
            for (var i = 0; i < intersects.length; ++i) {

                var object = intersects[i].object;
                var obj_data = object.userData;

                if (!obj_data.pickable) {
                    continue;
                }

                    if (obj_data.type == "edge") {

                        detach();

                        picked_object = intersects[i].object;

                        while(picked_object.parent.type !== "Scene")
                            picked_object = picked_object.parent;

                        attach(picked_object);

                        raycastHit = true;
                        break;

                    } else if (obj_data.type == "port") {

                        // if we already have one port and want to connect another
                        if (picked_port !== undefined && object.parent !== picked_object) {
                            
                            var picked_edge = picked_port.userData;
                            var matched_edge = obj_data;

                            graph.edges.push({
                                id:(graph.edges.length + 1).toString(),
                                source:picked_edge.source,
                                sourcePort:picked_edge.id,
                                target:matched_edge.source,
                                targetPort:matched_edge.id
                            });
            
                            detach();
                            if (!manual_mode)
                                calculate_graph(graph);

                        } else {

                            detach();
                            picked_object = object.parent;
                            while(picked_object.parent.type !== "Scene")
                                picked_object = picked_object.parent;

                            attach(picked_object);

                            picked_port = object;
                            picked_port.material.color.set(portSelectedColor);
                        }

                        raycastHit = true;
                        break;

                    } else if (obj_data.type == "component") {

                        detach();

                        picked_object = intersects[i].object;

                        while(picked_object.parent.type !== "Scene")
                            picked_object = picked_object.parent;

                        attach(picked_object);

                        raycastHit = true;

                        if (input.isKeyDown(17)) {
                            cloneButton.click();
                        }
                    }
                } 
                if (!raycastHit)
                    detach();
}

    $(document).on('keydown', function(event) {
if (event.keyCode == 86) // V
    cloneButton.click();
else if (event.keyCode == 46) // delete
    deleteButton.click();
else if (event.keyCode == 87) // W
    translation.click();
else if (event.keyCode == 69) // E
    rotation.click();
else if (event.keyCode == 82) // R
    scalingButton.click();
else if (event.keyCode == 27) // ESC
    camera_controls.reset();
else if (event.keyCode == 9) { // TAB 
    event.preventDefault();
    if (showingStats)
        document.body.removeChild(stats.dom);
    else
        document.body.append(stats.dom);

    showingStats = !showingStats;
}
})

// this runs when a file is loaded, it needs some work 
// as well as consistent file conventions to determine what type of file is loaded
    $('#file').change( function(e) {

        var file = e.target.files[0];
        if (file === undefined) 
            return;
        file_name = file.name;

        fileReader.onload = function(readFile) {
            playButton.classList.add("disabled");
            pauseButton.classList.add("disabled");
            stopButton.classList.add("disabled");

            var result = fileReader.result;
            var parsed_result = undefined;
            try {
                var parsed = JSON.parse(result);
                parsed_result = parsed;
            } catch(err) {
                alert("WAMS: " + err);
            }
            if (parsed_result === undefined)
                return;

            if (parsed_result.hasOwnProperty("metadata")) {
                if (parsed_result.metadata.generator === "OCT3D") {
                    object_controls.detach();
                }

                model = parsed_result;
                addModel(model);
                console.log("Model loaded");

            } else if (file.name.indexOf("_Fixed") != -1) {

                if (!manual_mode)
                    manualMode.click();

                object_controls.detach();
                graph = parsed_result;
                if (graph.edges === undefined)
                    graph.edges = [];
                display_graph(graph);
                console.log("Ready graph loaded");

                } else if (parsed_result.hasOwnProperty("id")) {

                    if (manual_mode)
                        manualMode.click();

                    object_controls.detach();
                    graph = parsed_result;
                    if (graph.edges === undefined)
                        graph.edges = [];
                    calculate_graph(graph);
                    console.log("Graph loaded");

                } else {
                    
                    if (model === undefined) {
                        alert("Please load a model first!");
                        return;
                    }

                    animation = JSON.parse(fileReader.result);
                    animator.addAnimation(model, animation);
                    console.log("Animation loaded");
                    playButton.classList.remove("disabled");
                    pauseButton.classList.remove("disabled");
                    stopButton.classList.remove("disabled");                
                }
};

detach();
fileReader.readAsBinaryString(file);

// allows same file to be loaded again
this.value = null;

});

// called when icons file is uploaded via Browse Icons
$('#icons').change(function(e) {

    var file = e.target.files[0];
    if (file === undefined) 
        return;

fileReader.onload = function(readFile) {

    var result = fileReader.result;
    var success = false;
    var parsed_result = undefined;

    try {
        var parsed = JSON.parse(result);
        parsed_result = parsed;
    } catch(err) {
        alert("WAMS: " + err);
    }

    if (parsed_result === undefined)
        return;

    parseIconsFile(parsed_result);

};

fileReader.readAsBinaryString(file);

});

var attach = function(obj) {
        cloneButton.classList.remove("disabled");
        deleteButton.classList.remove("disabled");
        rotateButton.classList.remove("disabled");
        object_controls.attach(obj);
        picked_object = obj;
        if (!display_graph) {
                    return;
        }
        var type = picked_object.userData.type;

        // picking edge
        if (type == "edge") {

        object_controls.detach();
        function set_material_color(_object, _color) {
                for (var i = 0; i < _object.children.length; ++i) {
                    var c = o.children[i];
                    if (c.material !== undefined)
                        c.material.color.set(c);
                    if (c.children !== undefined)
                        set_color(c);
                }
        }
        set_color(picked_object, connectionSelectedColor);

        // picking port or component
        } else {

            function loop(o) {
                for (var i = 0; i < o.children.length; ++i) {
                    var c = o.children[i];
                    if (c.children !== undefined)
                        loop(c);

                    if (c.material !== undefined) {
                        c.material.opacity = 0.5;
                    }
                }
            }

            var obj = picked_object.children[0];

            if (obj.children.length === 0)
                obj.material.opacity = 0.5;
            else
                loop(obj);
        }

        };

        // detaches controls from an object
        var detach = function() {

            if (picked_object === undefined) return; 

            // disable control buttons
            cloneButton.classList.add("disabled");
            deleteButton.classList.add("disabled");
            rotateButton.classList.add("disabled");
            object_controls.detach();

            if (!display_graph) {
                picked_object = undefined;
                return;
            }
            var type = picked_object.userData.type;

            if (type == "edge") {

                function set_color(o) {
                    for (var i = 0; i < o.children.length; ++i) {
                        var c = o.children[i];
                        if (c.material !== undefined)
                            c.material.color.set(connectionColor);
                        if (c.children !== undefined)
                            set_color(c);
                    }
                }
                set_color(picked_object);

            } else {

                if (picked_port !== undefined) {
                    picked_port.material.color.set(portColor);
                    picked_port = undefined;
                }

                function reset_opacity(o) {
                    for (var i = 0; i < o.children.length; ++i) {
                        var c = o.children[i];
                        if (c.children !== undefined)
                            reset_opacity(c);
    
                            if (c.material !== undefined) {
                                c.material.opacity = 1.0;
                            }
                    }
                }

                reset_opacity(picked_object);
            }

            picked_object = undefined;
    };

    cloneButton.onclick = function() {

            var copy = picked_object.userData;
            var c = picked_object.clone();
            var map = picked_object.children[0].material.map.clone();
            c.children[0].material = picked_object.children[0].material.clone();
            c.children[0].material.map = map;
            c.children[0].material.map.needsUpdate = true;

            for (var i  = 0; i < c.children.length - 1; ++i) {
                var child = c.children[i];
                var orig_child = picked_object.children[i];
                child.material = orig_child.material.clone();
                if (orig_child.material.map !== null) {
                    child.material.map = orig_child.material.map.clone();
                    child.material.map.needsUpdate = true;
                }
            }

            c.position.y += copySpacing;
            c.position.x += copySpacing;

            var r = /\d+/g;
            var s = picked_object.userData.id;
            var newId = s.replace(/\d+/g, '');
            var num = IDs[newId]++;
            newId = newId + num;

            c.userData.id = newId;

            for (var i = 0; i < c.children.length; ++i) {
                var port = c.children[i].userData;
                if (port.type == "port") {
                    var newPortId = port.id.split('.');
                    newPortId[0] = newId;
                    newPortId = newPortId.join('.');
                    port.id = newPortId.toString();
                    port.source = newId.toString();
                    c.userData.ports[i - 1].id = newPortId;
                    c.userData.ports[i - 1].source = newId;
                    ports.push(c.children[i]);
                } else if (port.type == "text") {
                    c.remove(port);
                    var t = text(newId);
                    t.userData.type = "text";
                    scene.add(t);
                }
            }
            // copy label, can be done much better    
            c.userData.labels[0] = c.userData.id;

            detach();
            attach(c);
            graph.children.push(c.userData);
    };

    // removes an object from the graph
    function deleteObject(_object) {

        var edges = graph.edges;
        var type = _object.userData.type;
        var id = _object.userData.id;

        if (type == "edge") {

            // remove edge from graph
            edges.removeValue("id", id);

        } else {

            // remove edges connected to component
            // start from end because we're removing objects
            for (var i = edges.length - 1; i >= 0; --i) {
                var e = edges[i];
                if (e.source == id || e.target == id)
                    edges.removeValue("id", e.id);
            }

            // remove component from graph
            graph.children.removeValue("id", id);

        }

        scene.remove(_object);
        detach();

        if (!manual_mode)
            calculate_graph(graph);
    };

    rotateButton.onclick = function() {
        picked_object.rotateZ(Math.PI / 2);
        for (var i = 0; i < picked_object.children.length; ++i) {
            var child = picked_object.children[i].userData;

            if (child.type == "port") {

                child.properties["de.cau.cs.kieler.portSide"] = rotatePortside(child.properties["de.cau.cs.kieler.portSide"]);

            } else if (child.type == "text") {

                picked_object.children[i].rotation.z = -picked_object.rotation.z;

            }
        }
    };

    var rotatePortside = function(portSide) {
        if (portSide == "WEST")
            return "NORTH";
        else if (portSide == "EAST")
            return "SOUTH";
        else if (portSide == "NORTH")
            return "EAST";
        else if (portSide == "SOUTH")
            return "WEST";
    };
    deleteButton.onclick = function() {
        deleteObject(picked_object);        
    };
    playButton.onclick = function() {
        animator.play();
    };
    pauseButton.onclick = function() {
        animator.pause();
    };
    stopButton.onclick = function() {
        animator.stop();
    };
    controlMode.onclick = function() {
        if(controlMode.checked) {     // 2D

            object_controls_2d.attach(picked_object);
            object_controls_3d.detach();
            object_controls = object_controls_2d;

        } else {

            object_controls_3d.attach(picked_object);
            object_controls_2d.detach();
            object_controls = object_controls_3d;

        }
    };
    manualMode.onclick = function() {
        manual_mode = manualMode.checked;
        if (!manual_mode) {
            calculate_graph(graph);
        }
    };

    window.addEventListener('resize', function() {

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight * windowHeightPercentage;
        camera.aspect = windowWidth / windowHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( windowWidth, windowHeight );

    }, false);

    resetCameraButton.onclick = function() {
        camera_controls.reset();
    };

    saveButton.onclick = function() {
        var file = new File([JSON.stringify
            (graph, null, '  ')], graph.id + ".json", {type: "text/plain;charset=utf-8"});
        saveAs(file);
    };
});