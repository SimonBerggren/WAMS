

var cloneButton = document.getElementById("clone");
var deleteButton = document.getElementById("delete");
var rotateButton = document.getElementById("rotate90");

var playButton = document.getElementById("play");
var pauseButton = document.getElementById("pause");
var stopButton = document.getElementById("stop");

var controlMode = document.getElementById("2d-control-mode");
var resetCameraButton = document.getElementById("resetCamera");

resetScene = function() {
    graph = undefined;
    parsed_graph = undefined;
    model = undefined;
    animation = undefined;
};
var initTouch;

var mouseMoved = false;
var mouseDown = false;

var timeDownUp = null;
var picked_port = undefined;
var port_found = false;
var matched_port = undefined;
var picked_object = undefined;
var graph = undefined;
var parsed_graph = undefined;
var model = undefined;

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

var renderer = new THREE.WebGLRenderer({alpha: true});
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

    if (picked_port !== undefined) {

            var raycaster = new THREE.Raycaster();
            camera.updateProjectionMatrix();
            raycaster.setFromCamera(input.getMouseCenterized(), camera);
            var intersects = raycaster.intersectObjects(ports, false);
            if (intersects.length > 0 ) {
                var port = intersects[0].object;
                if (port !== picked_port && picked_port.parent !== port.parent) {
                    matched_port = port;
                    port_found = true;
                }
                else {
                    matched_port = undefined;
                    port_found = false;
                }
            } 
            else {
                matched_port = undefined;
                port_found = false;
            }
    }

    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(render);
}

$('#glcontainer').on('mousedown', function(event) {

    mouseDown = true;

}).on('touchstart', function(e) {
    var event = e.originalEvent;
    if(event.changedTouches.length == 1)  {
        initTouch = new THREE.Vector2(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }

}).on('touchmove', function(e) {

// TODO: IMPLEMENT MOBILE DEVICE

}).on('touchend', function(e) {
    var event = e.originalEvent;
    if (event.changedTouches.length == 1) {
        var pos = new THREE.Vector2(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            initTouch = undefined;
    }

    }).on('mousedown', function(event) {
        timeDownUp = new Date().getTime();
        mouseMoved = false;
    }).on('mousemove', function(event) {
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

    }).on('mouseup', function(event) {

        timeDownUp = new Date().getTime();

        if (mouseMoved) {
            mouseDown = false;
            mouseMoved = false;
            return;
        }

            if (port_found) {
                port_found = false;

                var picked_edge = picked_port.userData;
                var matched_edge = matched_port.userData;

    parsed_graph.edges.push({
        id:(parsed_graph.edges.length + 1).toString(),
        source:picked_edge.source,
        sourcePort:picked_edge.id,
        target:matched_edge.source,
        targetPort:matched_edge.id
    });

    detach();    
    clearScene();
    camera_controls.reset();
    calculate_graph(JSON.stringify(parsed_graph));
    return;

            }
            var raycaster = new THREE.Raycaster();
            camera.updateProjectionMatrix();
            raycaster.setFromCamera(input.getMouseCenterized(), camera);
            var intersects = raycaster.intersectObjects(scene.children, true);
            var raycastHit = false;

            for (var i = 0; i < intersects.length; ++i) {
                if (intersects[i].object.userData.pickable) {
                    if (picked_object !== undefined) {
                        if (picked_port !== undefined) {
                            picked_port.material.opacity = 1.0;
                        }

                        var picking_port = false;

                        for (var j = 1; j < picked_object.children.length - 1; ++j) {
                            picked_object.children[j].visible = true;
                            if (intersects[i].object === picked_object.children[j] && intersects[i].object !== picked_port) {

                                picked_port = picked_object.children[j];
                                picked_port.material.opacity = 0.5;
                                picking_port = true;
                                raycastHit = true;

                                for (var p = 0; p < ports.length; ++p) {
                                    ports[p].visible = true;
                                }
                            }
                        }

                        if (picking_port)
                            break;
                        
                        else {
                        if (picked_port !== undefined) {
                            picked_port.material.opacity = 1.0;
                            picked_port = undefined;
                            for (var p = 0; p < ports.length; ++p) {
                                    ports[p].visible = false;
                            }
                        }
                        }
                        detach();
                    }

                    picked_object = intersects[i].object;

                    if (display_graph)
                        while(picked_object.parent.type !== "Scene")
                            picked_object = picked_object.parent;

                        attach(picked_object);

                        raycastHit = true;

                        break;
                    }
                } 
                if (!raycastHit)
                    detach();
            


}).append(renderer.domElement);



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

    $('#file').change( function(e) {
        var file = e.target.files[0];
        if (file !== undefined) {
            file_name = file.name;
            fileReader.onload = function(readFile) {
                playButton.classList.add("disabled");
                pauseButton.classList.add("disabled");
                stopButton.classList.add("disabled");

                var result = fileReader.result;
                var success = false;
                try {
                    var parsed_result = JSON.parse(result);
                    success = true;
                } catch(err) {
                    alert("WAMS: " + err);
                }
                if (!success)
                    return;

                if (parsed_result.hasOwnProperty("metadata")) {
                    if (parsed_result.metadata.generator === "OCT3D") {
                        object_controls.detach();
                        clearScene();
                    }

                    model = JSON.parse(fileReader.result);
                    addModel(model);
                    console.log("Model loaded");
                }
                
                else if (parsed_result.length !== undefined || parsed_result.hasOwnProperty("children") && parsed_result.children[0].x !== undefined) {
                    object_controls.detach();
                    clearScene();
                    graph = result;
                    parsed_graph = parsed_result;
                    display_graph(graph);
                    console.log("Ready graph loaded");
                }
                else if (parsed_result.hasOwnProperty("id")) {
                    object_controls.detach();
                    clearScene();
                    graph = result;
                    parsed_graph = parsed_result;
                    calculate_graph(graph);
                    console.log("Graph loaded");
                }
                else {
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

                camera_controls.reset();

};
detach();
fileReader.readAsBinaryString(file);
}
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
        var obj = picked_object.children[0];

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

            if (obj.children.length === 0)
                obj.material.opacity = 0.5;
            else
                loop(obj);

        for(var i = 1; i < picked_object.children.length - 1; ++i) {
            picked_object.children[i].visible = true;
        }

        };
        var detach = function() {
            cloneButton.classList.add("disabled");
            deleteButton.classList.add("disabled");
            rotateButton.classList.add("disabled");
            object_controls.detach();
            if (picked_object !== undefined) {
                if (!display_graph) {
                    picked_object = undefined;
                    return;
                }
                if (picked_port !== undefined) {
                for (var p = 0; p < ports.length; ++p) {
                        ports[p].visible = false;
                }
                    picked_port.material.opacity = 1.0;
                    picked_port = undefined;
                }
                var obj = picked_object.children[0];

        function loop(o) {
                for (var i = 0; i < o.children.length; ++i) {
                    var c = o.children[i];
                    if (c.children !== undefined)
                        loop(c);

                    if (c.material !== undefined) {
                        c.material.opacity = 1.0;
                    }
                }
            }

            if (obj.children.length === 0)
                obj.material.opacity = 1.0;
            else
                loop(obj);

            
            for(var i = 1; i < picked_object.children.length - 1; ++i) {
                picked_object.children[i].visible = false;
            }


            picked_object = undefined;
        }
    };

    cloneButton.onclick = function() {
        if (picked_object !== undefined) {

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

            c.position.y += 10;
            c.position.x += 10;

            var r = /\d+/g;
            var s = picked_object.userData.id;
            var newId = s.replace(/\d+/g, '');
            var num = IDs[newId]++;
            newId = newId + num;

            c.userData.id = newId;

            var portIDs = [];

            for (var i = 1; i < c.children.length - 1; ++i) {
                var port = c.children[i].userData;
                var newPortId = port.id.split('.');
                newPortId[0] = newId;
                newPortId = newPortId.join('.');
                port.id = newPortId.toString();
                port.source = newId.toString();
                c.userData.ports[i - 1].id = newPortId;
                c.userData.ports[i - 1].source = newId;
            }          

            c.remove(c.children[c.children.length - 1]);
            c.add(text(newId,0,0));
            scene.add(c);
            detach();
            attach(c);
            parsed_graph.children.push(c.userData);
        }
    };

    deleteButton.onclick = function() {
        var edgesToDelete = [];
        for (var i = 0; i < parsed_graph.edges.length; ++i) {
            if (parsed_graph.edges[i].source === picked_object.userData.id ||
                parsed_graph.edges[i].target === picked_object.userData.id)
                edgesToDelete.push(parsed_graph.edges[i]);
        }
        for (var i = 0; i < edgesToDelete.length; ++i)
            parsed_graph.edges.removeValue("id",edgesToDelete[i].id);

        parsed_graph.children.removeValue("id", picked_object.userData.id);

        scene.remove(picked_object);
        detach();
        clearScene();
        calculate_graph(JSON.stringify(parsed_graph));
    };

    rotateButton.onclick = function() {
        picked_object.rotateZ(Math.PI / 2);
        for (var i = 1; i < picked_object.children.length - 1; ++i) {
            var data = picked_object.children[i].userData;
            data.properties["de.cau.cs.kieler.portSide"] = rotatePortside(data.properties["de.cau.cs.kieler.portSide"]);
        }
        picked_object.children[picked_object.children.length - 1].rotation.z = -picked_object.rotation.z;
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

    window.addEventListener('resize', function() {

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight * windowHeightPercentage;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize( w, h );

    }, false);

    resetCameraButton.onclick = function() {
        camera_controls.reset();
    };
});