// main file, contains most logic in app, picking, loading, button events
// global elements from HTML

var saveButton = document.querySelectorAll("save");
var newButton = document.querySelectorAll("new");
var openButton = document.querySelectorAll("open");
var openIconsButton = document.querySelectorAll("open-icons");

var MODES = {
    AUTO: "automatic",
    MANUAL: "manual",
    NESTED: "nested",
    VISUAL: "visualization"
};

var modeButtons = [];

var typeModes = document.querySelectorAll(".type-mode");

var oldMode = undefined;
var mode = undefined;

for (var i = 0; i < typeModes.length; ++i) {

    modeButtons[typeModes[i].value] = typeModes[i];
    typeModes[i].onclick = function() {

         mode = this.value;


        if (mode == oldMode) return;

        detach();
        animator.stop();
        resetCamera = true;
        model_mode = false;
        manual_mode = false;

     

        if (mode == MODES.AUTO) {

                    for( var i = scene.children.length - 1; i >= 0; i--) {
            if (scene.children[i].userData.type !== "static") {
                scene.children[i].userData.connections = undefined;
                scene.remove(scene.children[i]);
            }
        }  

            if (combined_mode) {
                calculateCombinedGraph(graph, graph_icons);
            } else {
                calculate_graph(graph);
            }            

        } else if (mode == MODES.MANUAL) {

            manual_mode = true;
            

            // if (combined_mode) {
            //     display_graph(graph_fixed, graph_fixed_icons);
            // } else {
            //     display_graph(graph);
            // }

        } else if (mode == MODES.NESTED) {

                    for( var i = scene.children.length - 1; i >= 0; i--) {
            if (scene.children[i].userData.type !== "static") {
                scene.children[i].userData.connections = undefined;
                scene.remove(scene.children[i]);
            }
        }  

            if (combined_mode) {
                calculateCombinedGraph(graph_nested, graph_nested_icons);
            } else {
                calculate_graph(graph);
            }             

        } else if (mode == MODES.VISUAL) {

                    for( var i = scene.children.length - 1; i >= 0; i--) {
            if (scene.children[i].userData.type !== "static") {
                scene.children[i].userData.connections = undefined;
                scene.remove(scene.children[i]);
            }
        }  

            model_mode = true;

            addModel(model);
        }
    };
}



function handleMode() {
    if (manual_mode) {

        if (combined_mode) {
            display_graph(graph_fixed, graph_fixed_icons);
        } else {
            display_graph(graph);
        }

    } else {

        if (combined_mode) {
            calculateCombinedGraph(graph, graph_icons);
        } else {
            calculate_graph(graph);
        }
    }
}

for (var i = 0; i < newButton.length; i++) {
  newButton[i].onclick = function() {
    newFile();
  }
}

for (var i = 0; i < saveButton.length; i++) {
  saveButton[i].onclick = function() {
    saveFile();
  }
}

for (var i = 0; i < openButton.length; i++) {
  openButton[i].onclick = function() {
    openFile();
  }
}

for (var i = 0; i < openIconsButton.length; i++) {
  openIconsButton[i].onclick = function() {
    openIconsFile();
  }
}

var playButton = document.getElementById("play");
var pauseButton = document.getElementById("pause");
var stopButton = document.getElementById("stop");

var cloneButton = document.getElementById("clone");
var deleteButton = document.getElementById("delete");
var rotateButton = document.getElementById("rotate90");

var controlMode = document.getElementById("2d-control-mode");
var resetCameraButton = document.getElementById("resetCamera");

var renderContainer = document.getElementById("projection-canvas");

var animationTimeScale = document.getElementById("animationTimeScale");

animationTimeScale.value = 100;
var timeScale = animationTimeScale.value / 100;

animationTimeScale.onchange = function(event) {
    var num = parseInt(event.target.value);
    if (isNaN(num))
        return;
    timeScale = num / 100;
};
// variabels used within app

var mouseMoved = false;
var mouseDown = false;


var timeDownUp = null;
var picked_port = undefined;
var picked_object = undefined;
var picking_port = false;

var stats = new Stats();
stats.showPanel( 0 );

if (showingStats)
    document.body.append(stats.dom);

// main initialize function

input = new Input();
animator = new Animator();
scene = new THREE.Scene();

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

for (var i = 0; i < directionalLights.length; ++i) {
    var config = directionalLights[i];
    var pos = config.position;
    var color = config.color == undefined ? directionalLightColor : config.color;
    var intensity = config.intensity == undefined ? directionalLightIntensity : config.intensity;
    var light = new THREE.DirectionalLight( color, intensity );
    light.position.set(pos.x, pos.y, pos.z);
    light.userData.type = "static";
    scene.add(light);
}

var light = new THREE.AmbientLight( ambientLightColor, ambientLightIntensity );
light.userData.type = "static";
scene.add(light);

// set up object controls

object_controls_2d = new THREE.TransformControls2D(camera, camera_controls, renderer.domElement);
object_controls_2d.userData.type = "static";
object_controls_2d.setOnMove(function(){mouseMoved = true;updateConnections();});   // disable picking if using object controls
scene.add(object_controls_2d);

object_controls_3d = new THREE.TransformControls3D(camera, camera_controls, renderer.domElement);
object_controls_3d.userData.type = "static";
object_controls_3d.setOnMove(function(){mouseMoved = true;updateConnections();});   // disable picking if using object controls
scene.add(object_controls_3d);

object_controls = object_controls_2d;

// init delta time, start rendering
var clock = new THREE.Clock();
render();

function render() {
    stats.begin();

    object_controls.update();
    var delta = clock.getDelta();

    animator.update(delta * timeScale);

    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(render);
}

// hook up events to canvas

$('#projection-canvas').on('touchstart', function(e) {
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

// shortcuts
$(document).on('keydown', function(event) {
    if (event.keyCode == cloneKey) // clone object
        cloneButton.click();
    else if (event.keyCode == deleteKey) // delete object
        deleteButton.click();
    else if (event.keyCode == translationKey) // object translation mode
        translation.click();
    else if (event.keyCode == rotationKey) // object rotation mode
        rotation.click();
    else if (event.keyCode == scalingKey) // object scaling mode
        scalingButton.click();
    else if (event.keyCode == resetKey) // reset camera
        camera_controls.reset();
    else if (event.keyCode == statsKey) { // show stats
        event.preventDefault();
        if (showingStats)
            document.body.removeChild(stats.dom);
        else
            document.body.append(stats.dom);

        showingStats = !showingStats;
    }
});

// called on mousemove and touchmove
// it is also called 10ms after moseup and touchend
// timeMove checks if it was 10ms since mouseup,
// in that case we ignore the call to pointerMove
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

// called on mousedown and touchstart
function pointerDown() {
    timeDownUp = new Date().getTime();
    mouseMoved = false;
    mouseDown = true;
};

// called on mouseup and touchend
function pointerUp(touch, event) {
    timeDownUp = new Date().getTime();

    mouseDown = false;
    if (mouseMoved) {
        mouseMoved = false;
        return;
    }

    // when using touch, only try raycasting if using 1 finger
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

                raycastHit = true;

                if (obj_data.type == "port") {

                    // if we already have one port
                    // and other port is not part of same component
                    if (picked_port !== undefined && object.parent !== picked_object) {

                        // add new edge to graph
                        // generate new id
                        var newId = (++edgeID).toString();
                        var edge = {
                            id: newId,
                            source: picked_port.userData.source,
                            sourcePort: picked_port.userData.id,
                            target: obj_data.source,
                            targetPort: obj_data.id
                        };

                        if (combined_mode) {

                            if (manual_mode) {
                                // graph_fixed.edges.push(edge);
                                graph.edges.push(edge);
                            } else {
                                graph.edges.push(edge);
                            }
                        } else {
                            if (manual_mode) {
                                graph.edges.push(edge);
                            } else {
                                graph.edges.push(edge);
                            }
                        }

                        if (manual_mode) {

                            var startPosition = new THREE.Vector3().setFromMatrixPosition( picked_port.matrixWorld );
                            var endPosition = new THREE.Vector3().setFromMatrixPosition( object.matrixWorld );

                            var connection = new THREE.Group();
                            connection.add(cylinder(startPosition, endPosition));
                            connection.userData.id = edge.id;
                            connection.userData.startPosition = endPosition;
                            connection.userData.endPosition = startPosition;
                            connection.userData.startPort = picked_port;
                            connection.userData.endPort = object;
                            connection.userData.startConnection = connection.children.first();
                            connection.userData.endConnection = connection.children.first();
                            connection.userData.numBendPoints = 0;

                            connection.setPickable();
                            connection.setType("edge");

                            scene.add(connection);
                            picked_object.userData.connections.push(connection);
                            object.parent.userData.connections.push(connection);
                            picked_port.setColor(portColor);
                            setPortsVisible(false);
                            attach(picked_object);

                        } else {

                            // reset controls
                            detach();
                            calculate_graph(graph);
                        }

                    // if no port is picked or other port has same parent
                    } else {

                        // hightlight & display ports
                        picked_port = object;
                        picked_port.setColor(portSelectedColor);
                        setPortsVisible(true);

                    }


                    break;
                }

                // deselect any old objects
                detach();

                picked_object = object;

                // get the top most object in the hierarchy
                // so all components and ports moves with the controls

                while(picked_object.parent.type !== "Scene")
                    picked_object = picked_object.parent;

                attach(picked_object);

                // if holding key, clone component
                if (obj_data.type == "component") {

                    if (input.isKeyDown(cloneHoldKey)) {
                        cloneButton.click();
                    }
                }
            break;
            }

            // if nothing pickable was hit, detach any picked object
            if (!raycastHit) {
                detach();
        }
}

// hides or show all ports in the scene
function setPortsVisible(_visible) {
    for(var i = 0; i < ports.length; ++i) {
        ports[i].visible = _visible;
    }
}

function updateConnections() {
    if (picked_object == undefined)
        return;
    var connections = picked_object.userData.connections;
    if (connections == undefined)
        return;
    for (var i = connections.length - 1; i >= 0; --i) {
        // if moving_conn [i] picked = picked object
        var conn = connections[i];
        var startPort = conn.userData.startPort;
        if (startPort.parent == picked_object) {
            var portPosition = new THREE.Vector3().setFromMatrixPosition( startPort.matrixWorld );
            var startConnection = conn.userData.startConnection;
            if (startConnection !== undefined) {
                conn.remove(startConnection);
                scene.remove(startConnection);
            }
            var newStartConnection = cylinder(conn.userData.startPosition, portPosition);
            conn.add(newStartConnection);
            conn.userData.startConnection = newStartConnection;
            if (conn.userData.numBendPoints == 0) {
                conn.userData.endConnection = newStartConnection;
                conn.userData.endPosition = portPosition;
            }
        } else {
            
            var endPort = conn.userData.endPort;
            var portPosition = new THREE.Vector3().setFromMatrixPosition( endPort.matrixWorld );
            var endConnection = conn.userData.endConnection;
            if (endConnection !== undefined) {
                conn.remove(endConnection);
                scene.remove(endConnection);
            }
            var newEndConnection = cylinder(conn.userData.endPosition, portPosition);
            conn.add(newEndConnection);
            conn.userData.endConnection = newEndConnection;
            if (conn.userData.numBendPoints == 0) {
                conn.userData.startConnection = newEndConnection;
                conn.userData.startPosition = portPosition;
            }
        }
        conn.setPickable();
        conn.setType("edge");
    }
};

// attaches control to an object
function attach(obj) {

    // enable controls
    document.body.classList.add('is-selected-object');
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
function detach() {

    if (picked_object === undefined) return;

    // disable controls
    document.body.classList.remove('is-selected-object');
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
    var event = new CustomEvent('closeObjectPanel');
    document.dispatchEvent(event);
};

// clones selected component
cloneButton.onclick = function() {


        var newId = generateNewId(picked_object.userData.id);
        var connections = picked_object.userData.connections;
        picked_object.userData.connections = undefined;
        var clone = picked_object.clone();
        picked_object.userData.connections = connections;
        clone.userData.connections = [];
        scene.add(clone);
        clone.userData.id = newId;

        for (var i = 0; i < clone.children.length; ++i) {
            var c = clone.children[i];
            var data = c.userData;

            // when cloning three js objects, materials and maps need to be explicitly cloned
            // otherwise they reference to the same map, resulting in two objects sharing i.e opacity

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

        // copy label, can be done much better
        clone.userData.labels[0] = clone.userData.id;

        // move new object a bit
        clone.position.y += copySpacing;
        clone.position.x += copySpacing;

        // detach old object, attach new and add cloned component to graph

        detach();
        attach(clone);
        if (combined_mode) {
            if (manual_mode) {
                 // graph_fixed.children.push(clone.userData);
                 graph.children.push(clone.userData);
            } else {
                graph.children.push(clone.userData);    
            }
        } else {
            if (manual_mode) {
                graph.children.push(clone.userData);
            } else {
                graph.children.push(clone.userData);
            }
        }
};

// removes an object from the graph
function deleteObject(_object) {

    var edges = undefined;

    if (combined_mode) {
        if (manual_mode) {
            // edges = graph_fixed.edges;
            edges = graph.edges;
        } else {
            edges = graph.edges;
        }
    } else {
        if (manual_mode) {
            edges = graph.edges;
        } else {
            edges = graph.edges;
        }
    }

    var type = _object.userData.type;
    var id = _object.userData.id;

    if (type == "edge") {
        if (edges != undefined) {

            // remove edge from graph
            edges.removeValue("id", id);
        }

    } else {

        if (edges != undefined) {

            // remove edges connected to component
            // start from end because we're removing objects and dont want to miss objects
            for (var i = edges.length - 1; i >= 0; --i) {
                var e = edges[i];

                if (e.source == id || e.target == id)
                    edges.removeValue("id", e.id);
            }

        }

        var connections = _object.userData.connections;
        if (connections != undefined)
            for (var i = 0; i < connections.length; ++i) {
                var conn = connections[i];
                var startPort = conn.userData.startPort;
                var endPort = conn.userData.endPort;

                if (startPort.parent == picked_object) {
                    endPort.parent.userData.connections.removeValue("id",conn.id);
                } else {
                    startPort.parent.userData.connections.removeValue("id",conn.id);
                }
            }



        for (var i = 0; i <  _object.children.length; ++i) {
            var c = _object.children[i];
            if (c.userData.type == "port") {
                ports.remove(c);
            }
        }

        // remove component from graph

        if (combined_mode)
            if (manual_mode) {
                // graph_fixed.children.removeValue("id", id);
                graph.children.removeValue("id", id);
            } else {
                graph.children.removeValue("id", id);    
            }
        else {
            if (manual_mode) {
                graph.children.removeValue("id", id);  
            } else {
                graph.children.removeValue("id", id);       
            }
        }
    }

    var connections = _object.userData.connections;
    if (manual_mode) {
        for(var i = 0; i < picked_object.userData.connections.length; ++i) {
            scene.remove(picked_object.userData.connections[i]);
        }
        scene.remove(_object);
        detach();
    } else {
        scene.remove(_object);
        detach();
        calculate_graph(graph);
    }
};



// BUTTONS

deleteButton.onclick = function() {
    deleteObject(picked_object);
};

rotateButton.onclick = function() {
    picked_object.rotateZ(Math.PI / 2);

    function rotatePortside(portSide) {
        if (portSide == "WEST")
            return "NORTH";
        else if (portSide == "EAST")
            return "SOUTH";
        else if (portSide == "NORTH")
            return "EAST";
        else if (portSide == "SOUTH")
            return "WEST";
    };

    for (var i = 0; i < picked_object.children.length; ++i) {
        var child = picked_object.children[i].userData;

        if (child.type == "port") {

            child.properties["de.cau.cs.kieler.portSide"] = rotatePortside(child.properties["de.cau.cs.kieler.portSide"]);

        } else if (child.type == "text") {

            picked_object.children[i].rotation.z = -picked_object.rotation.z;

        }
    }
    updateConnections();
};

controlMode.onclick = function() {
    if(controlMode.checked) {     // 2D
        object_controls = object_controls_2d;
        if (picked_object != undefined) {
            object_controls_2d.attach(picked_object);
            object_controls_3d.detach();
        }

    } else {
        object_controls = object_controls_3d;
        if (picked_object != undefined) {
            object_controls_3d.attach(picked_object);
            object_controls_2d.detach();
        }

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

function saveFile() {
   var file = new File([JSON.stringify
        (graph, null, '  ')], graph.id + ".json", {type: "text/plain;charset=utf-8"});
    saveAs(file);
};

function newFile () {
  graph = {};
  graph.children = [];
  graph.edges = [];
  graph_fixed = {};
  graph_fixed.children = [];
  graph_fixed.edges = [];
  edgeID = 0;
  file_name = undefined;
  detach();
  clearScene();
  //hideLoader();
  camera_controls.setResetPosition(0,0);
  camera_controls.reset();
}

function openFile () {
  document.getElementById('file').click();
}

function openIconsFile () {
  document.getElementById('icons').click();
}

playButton.onclick = function() {
  animator.play();
};
pauseButton.onclick = function() {
  animator.pause();
};
stopButton.onclick = function() {
  animator.stop();
};

function handleModel(_model, _type) {
    object_controls.detach();
    addModel(_model, _type);
    camera_controls.reset();
}

// file loading
var finishedLoading;
var timer;
  // this runs when a file is loaded, it needs some work
// as well as consistent file conventions to determine what type of file is loaded
    $('#file').change( function(e) {
        finishedLoading = false;

        var file = e.target.files[0];
        if (file === undefined) {
          finishedLoading = true;
          if (loaderTimerEnded()) {
            hideLoader();
          }
          return;
        }
        file_name = file.name;


        // set up callback for when reading file is complete
        fileReader.onload = function(readFile) {

            var result = fileReader.result;
            var parsed_result = undefined;
            combined_mode = false;

            var split = file_name.split(".");
            var type = split[split.length - 1].toLowerCase();   // get file extension

            if (type == "obj" || type == "mtl") {

                handleModel(result, type);
                if (!controlMode.checked) {// 2D
                    controlMode.click();
                }

            } else {

                try {
                    var parsed = JSON.parse(result);
                    parsed_result = parsed;
                    parsedJSON = parsed_result;
                } catch(err) {
                    alert("WAMS: " + err);
                }
                if (parsed_result === undefined) {
                  finishedLoading = true;
                  return;
                }
                // if file contains the metadata, assume 3D model
                if (parsed_result.hasOwnProperty("metadata")) {

                    // 3D model
                    var generator = parsed_result.metadata.generator;
                    if (generator === "io_three" || generator.toLowerCase().indexOf("3d") != -1) {
                        model = parsed_result;
                        handleModel(model, type);
                        if (!controlMode.checked) {// 2D
                            controlMode.click();
                        }
                    // combined diagram
                    } else if (parsed_result.metadata.type.toLowerCase().indexOf("combined") !== -1) {

                        combined_mode = true;
                        
                        graph = parsed_result["KlayJS"];
                        graph_icons = parsed_result["KlayJS_Icons"];
                        graph_fixed = parsed_result["KlayJS_Fixed"];
                        graph_fixed_icons = parsed_result["KlayJS_Fixed_Icons"];
                        graph_nested = parsed_result["KlayJS_Nested"];
                        graph_nested_icons = parsed_result["KlayJS_Nested_Icons"];
                        model = parsed_result["threeJS"];
                        animation = parsed_result["animationMatrices"];

                        if (animation != undefined && model != undefined) {
                            animator.addAnimation(model, animation);
                        }
                        if (graph != undefined) {
                            modeButtons[MODES.AUTO].click();
                        } else if (model != undefined) {
                            modeButtons[MODES.VISUAL].click();
                        } else if (graph_fixed != undefined) {
                            modeButtons[MODES.MANUAL].click();
                        } else if (graph_nested != undefined) {
                            modeButtons[MODES.NESTED].click();
                        }

                    }
                } else if (parsed_result.hasOwnProperty("id")) {

                    // display_graph

                    object_controls.detach();

                    graph = parsed_result;

                    if (graph.edges == undefined)
                        graph.edges = [];

                    // if file name contains _Fixed, we don't send the graph to Klay JS
                    /* manualModeButton.checked = */ manual_mode = file_name.toLowerCase().indexOf("_fixed") != -1;

                    if (manual_mode) {
                        display_graph(graph);
                    } else {
                        calculate_graph(graph);
                    }

                    // if we dont find metadata or id, assume animation to currently loaded model
                } else {

                    if (model === undefined) {
                        finishedLoading = true;
                        alert("Please load a model first!");
                        return;
                    }

                    animation = JSON.parse(fileReader.result);
                    animator.addAnimation(model, animation);
                }
            }
            finishedLoading = true;
};

// detach any old object and read file
detach();
fileReader.readAsBinaryString(file);

// allows same file to be loaded again
this.value = null;

});

  // called when icons file is uploaded via Browse Icons
$('#icons').change(function(e) {
    finishedLoading = false;
    showLoader('Loading...');
    timer = setTimeout(hasFinishedLoading, 2000);
    var file = e.target.files[0];
    if (file === undefined) {
        finishedLoading = true;
        if (loaderTimerEnded()) {
            hideLoader();
        }
        return;
    }

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

        if (parsed_result === undefined) {
            finishedLoading = true;
            if (loaderTimerEnded()) {
                hideLoader();
            }
            return;
        }

        parseIconsFile(parsed_result);

    };

    fileReader.readAsBinaryString(file);
    finishedLoading = true;
    if (loaderTimerEnded()) {
        hideLoader();
    }

});


function addObject(_name, _svg, _info) {
    loadSVG(_svg, _name, function() {

        var group = new THREE.Group();
        var svgImage = icons_svg[_name];
        var material = new THREE.MeshLambertMaterial({map:svgImage, transparent:true});
        var geometry = new THREE.BoxGeometry( svgImage.image.width, svgImage.image.height, 0.01 );
        obj = new THREE.Mesh(geometry,material);
        group.add(obj);
        group.setType("component");

        var vector = new THREE.Vector3();
        var mouse = input.getMouseCenterized();
        vector.set( 0, mouse.y, -1 );

        vector.unproject( camera );

        var dir = vector.sub( camera.position ).normalize();

        var distance = - camera.position.z / dir.z;

        var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

        group.translateOnAxis(new THREE.Vector3(pos.x, pos.y, 0), 1);

        var id = generateNewId(_name);

        if(_info != undefined) {

            var info = JSON.parse(_info);
            group.userData = info;
    
            if (info.ports !== undefined && info.ports.length > 0) {

                for (var j = 0; j < info.ports.length; ++j) {

                    var p = info.ports[j];
                    var pw = p.width;
                    var ph = p.height;
                    var px = p.x - svgImage.image.width/2 + pw;
                    var py = -p.y + svgImage.image.height/2 - ph;
                    var pz = portZpos;
                    var pin = plane(px, py, pz, pw * portScale, ph * portScale, portColor);

                    p.id = id + "." + p.id;
                    pin.userData = p;
                    pin.userData.source = id;
                    pin.visible = false;
                    pin.setType("port");
                    ports.push(pin);
                    group.add(pin);
                }
            }
        }


        var t = text(_name);
        t.rotation.z = -group.rotation.z;
        t.userData.type = "text";
        if (textEnabled)
            group.add(t);

        group.setPickable();
        
        group.userData.id = id;
        group.userData.connections = [];

        scene.add(group);

        var child = _info != undefined ? info : {
            "class": _name,
            "height": svgImage.image.height,
            "width": svgImage.image.width,
            "id": id,
            "labels": [
              {
                "text": id.toString()
              }
            ],
        };

        if (!graph.hasOwnProperty('children')) {
          graph.children = [];
        }
        if (!graph_fixed.hasOwnProperty('children')) {
          graph_fixed.children = [];
        }
        if (combined_mode) {
            if (manual_mode) {
                // graph_fixed.children.push(child);
                graph.children.push(child);
            } else {
                graph.children.push(child);
            }
        } else {
            if (manual_mode) {
                graph.children.push(child);
            } else {
                graph.children.push(child);        
            }
        }
    });
};