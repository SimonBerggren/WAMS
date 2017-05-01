// main file, contains initialization, update and render loop

// global elements from HTML

var manualMode = document.getElementById("manual-mode");
var saveButton = document.getElementById("save");

var cloneButton = document.getElementById("clone");
var deleteButton = document.getElementById("delete");
var rotateButton = document.getElementById("rotate90");

var controlMode = document.getElementById("2d-control-mode");
var resetCameraButton = document.getElementById("resetCamera");

var renderContainer = document.getElementById("glcontainer");

// variabels used within app

var mouseMoved = false;
var mouseDown = false;

var graph = undefined;
var timeDownUp = null;
var picked_port = undefined;
var picked_object = undefined;
var picking_port = false;

var stats = new Stats();
stats.showPanel( 0 );

if (showingStats)
    document.body.append(stats.dom);


// main initialize function

$(function() {

input = new Input();
scene = new THREE.Scene();
animator = new Animator();

// set up renderer

var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.setClearColor( clearColor, 1 );
renderer.setSize(windowWidth, windowHeight);

// set up camera and camera controls

camera = new THREE.PerspectiveCamera( camerFieldOfView, windowWidth / windowHeight, cameraFrontClip, cameraBackClip );
camera_controls = new THREE.OrbitControls(camera, renderer.domElement);
camera_controls.addEventListener('change', function() { renderer.render(scene, camera); }); 
camera_controls.setResetPosition(0,0);

// set up lights

var directionalLight = new THREE.DirectionalLight( directionalLightColor, directionalLightIntensity );
directionalLight.position.set(directionalLightPosition.x, directionalLightPosition.y, directionalLightPosition.z);
directionalLight.userData.type = "static";
scene.add(directionalLight);

var light = new THREE.AmbientLight( ambientLightColor, ambientLightIntensity );
light.userData.type = "static";
scene.add(light);

// set up object controls

object_controls_2d = new THREE.TransformControls2D(camera, camera_controls, renderer.domElement);
object_controls_2d.userData.type = "static";
object_controls_2d.setOnMove(function(){mouseMoved = true;});   // disable picking if using object controls
scene.add(object_controls_2d);

object_controls_3d = new THREE.TransformControls3D(camera, camera_controls, renderer.domElement);
object_controls_3d.userData.type = "static";
object_controls_3d.setOnMove(function(){mouseMoved = true;});   // disable picking if using object controls
scene.add(object_controls_3d);

object_controls = object_controls_2d;

// init delta time, start rendering
var clock = new THREE.Clock();
render();

function render() {
    stats.begin();
    
    object_controls.update();
    var delta = clock.getDelta();

    animator.update(delta);

    renderer.render(scene, camera);

    stats.end();

    renderContainer.focus();

    requestAnimationFrame(render);
}

// hook up events to canvas

$('#glcontainer').on('touchstart', function(e) {
    pointerDown();    
}).on('touchmove', function(e) {
    pointerMove();
}).on('touchend', function(e) {
    pointerUp(true, e.originalEvent)
}).on('mousedown', function(e) {
    pointerDown();
}).on('mousemove', function(e) {
    pointerMove();
}).on('mouseup', function(e) {
    pointerUp(false);        
}).append(renderer.domElement);

// functions

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

// casts a ray on click point
// some repetetive code in here that needs cleanup
function CheckRaycast(touch) {
    var center = touch ? input.getTouchCenterized() : input.getMouseCenterized();

            var raycaster = new THREE.Raycaster();
            camera.updateProjectionMatrix();
            raycaster.setFromCamera(center, camera);
            var intersects = raycaster.intersectObjects(scene.children, true);
            var raycastHit = false;

            // for each objects hit by raycast
            for (var i = 0; i < intersects.length; ++i) {

                var object = intersects[i].object;
                var obj_data = object.userData;

                if (!obj_data.pickable) {
                    continue;
                }
                
                if (obj_data.type == "port") {

                    // if we already have one port and want to connect another
                    // and other port is not part of same component
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

                        setPortsVisible(true);

                    }

                    raycastHit = true;
                    break;
                }                

                detach();
                
                picked_object = intersects[i].object;

                while(picked_object.parent.type !== "Scene")
                    picked_object = picked_object.parent;

                attach(picked_object);

                raycastHit = true;

                picking_port = true;

                // if holding ctrl, clone component
                if (obj_data.type == "component") {

                    if (input.isKeyDown(17)) {
                        cloneButton.click();
                    }
                }
            break;
            }

            if (!raycastHit) {
                detach();
        }
}

function setPortsVisible(_visible) {
    for(var i = 0; i < ports.length; ++i) {
        ports[i].visible = _visible;
    }
}

// short cuts
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

        // set up callback for when reading file is complete
        fileReader.onload = function(readFile) {

            // assume diagram, disable animation
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

            // if file contains the metadata, assume 3D model
            if (parsed_result.hasOwnProperty("metadata")) {
                if (parsed_result.metadata.generator === "OCT3D") {
                    object_controls.detach();
                }

                model = parsed_result;
                addModel(model);
                camera_controls.reset();

            } else if (parsed_result.hasOwnProperty("id")) {

                // if diagram
                // detach any old 

                object_controls.detach();

                graph = parsed_result;

                if (graph.edges === undefined)
                    graph.edges = [];

                // if file name contains _Fixed, we don't send the graph to Klay JS
                manualMode.checked = manual_mode = file.name.indexOf("_Fixed") != -1;

                if (manual_mode) {
                    display_graph(graph);
                } else {
                    calculate_graph(graph);
                }

                // if we dont find metadata or id, assume animation to currently loaded model
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

// attaches control to an object
var attach = function(obj) {

    // enable controls
    cloneButton.classList.remove("disabled");
    deleteButton.classList.remove("disabled");
    rotateButton.classList.remove("disabled");
    object_controls.attach(obj);
    picked_object = obj;

    if (!display_graph) {
        return;
    }

    // picking edge
    if (picked_object.userData.type == "edge") {

        // detach controls so user dont move edge, need to support this feature later
        // update selected edge color

        object_controls.detach();
        picked_object.setColor(connectionSelectedColor);

    // picking component, ports may not be attached
    } else {

        // set opacity for selected component
        for (var i = 0; i < picked_object.children.length; ++i) {
            var c = picked_object.children[i];
            if (c.userData.type == "component") {
                c.setOpacity(selectedComponentOpacity);
            } else if (c.userData.type == "port")
                c.visible = true;
        }
    }

};

// detaches controls from an object
var detach = function() {

    if (picked_object === undefined) return; 

    // disable controls
    cloneButton.classList.add("disabled");
    deleteButton.classList.add("disabled");
    rotateButton.classList.add("disabled");
    object_controls.detach();

    if (!display_graph) {
        picked_object = undefined;
        return;
    }

    if (picked_object.userData.type == "edge") {

        // if detaching edge, only reset color
        picked_object.setColor(connectionColor);

    } else {

        // if detaching component, reset port color and component opacity

        picked_object.setOpacity(1.0);
    }

    if (picked_port !== undefined) {
        picked_port.setColor(portColor);
        picked_port = undefined;
    }

    setPortsVisible(false);

    picked_object = undefined;
};

// need to clean this up
cloneButton.onclick = function() {

        // when cloning three js objects, materials and maps need to be explicitly cloned
        // otherwise they reference to the same map, resulting in two objects sharing i.e opacity

        // generate a new ID, i.e Clutch1 -> Clutch2
        var r = /\d+/g;
        var s = picked_object.userData.id;
        var newId = s.replace(/\d+/g, '');
        var num = IDs[newId]++;
        newId = newId + num;

        var clone = picked_object.clone();
        scene.add(clone);
        clone.userData.id = newId;

        for (var i = 0; i < clone.children.length; ++i) {
            var c = clone.children[i];
            var data = c.userData;

            if (data.type == "component") {

                var material = picked_object.children[i].material.clone();
                c.material = material;
                c.material.map = material.map.clone();
                c.material.map.needsUpdate = true;

            } else if (data.type == "port") {

                c.material = picked_object.children[i].material.clone();

                // change port IDs
                // i.e Clutch1.port = Clutch2.port

                var newPortId = data.id.split('.');
                newPortId[0] = newId;
                newPortId = newPortId.join('.');
                data.id = newPortId.toString();
                data.source = newId.toString();
                clone.userData.ports[i - 1].id = newPortId;
                clone.userData.ports[i - 1].source = newId;

                // add to all ports
                ports.push(clone.children[i]);                

            } else if (data.type == "text") {

                c.remove(c);
                var t = text(newId);
                t.userData.type = "text";
                scene.add(t);                

            }
        }

        // move new object a bit
        clone.position.y += copySpacing;
        clone.position.x += copySpacing;

        // copy label, can be done much better    
        clone.userData.labels[0] = clone.userData.id;

        // detach old object, attach new and add cloned component to graph
        
        detach();
        attach(clone);
        graph.children.push(clone.userData);
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
        // start from end because we're removing objects and dont want to miss objects
        for (var i = edges.length - 1; i >= 0; --i) {
            var e = edges[i];
            if (e.source == id || e.target == id)
                edges.removeValue("id", e.id);
        }

        // for (var i = 0; i <  _object.children.length; ++i) {
        //     var c = _object.children[i];
        //     if (c.userData.type == "port") {
        //         ports.removeValue( c);
        //     }
        // }

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