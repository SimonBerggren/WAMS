(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();
(function(){keyCode=function(a){return Math.max(b,Math.min(c,a));}})();

THREE.Group.prototype.Please = {};

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

var newId = 100;
var newEdgeId = 100;
var newPortId = 100;
var collidedPort1a;
var collidedPort2a;
var collidedPort1b;
var collidedPort2b;
var o1,o2;
var collisionTime = 2.0;
var currCollisionTime = 0.0;
var countCollision = false;
var initTouch;

var connection_a_made = false;
var connection_b_made = false;

var mouseMoved = false;
var mouseDown = false;

var recalc = false;

$(function() {
    var picked_object = undefined;
    var graph = undefined;
    var parsed_graph = undefined;
    var model = undefined;

    input = new Input();
    scene = new THREE.Scene();
    animator = new Animator();

    var collSphere = sphere(0,0);
    collSphere.visible = false;
    collSphere.name={name:"important"};
    collSphere.material.color.set(0x00ff00);
    scene.add(collSphere);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
    directionalLight.position.set(0,0,10);
    directionalLight.name={name:"important"};
    scene.add(directionalLight);

var light = new THREE.AmbientLight( "white", 0.5 ); // soft white light
light.name={name:"important"};
scene.add(light);

var w = window.innerWidth;
var h = window.innerHeight * 0.85;

var renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setClearColor( "gray", 1 );
renderer.setSize(w, h);

camera = new THREE.PerspectiveCamera( 50, w / h, 1, 3000 );
camera.position.z = 500;

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
    camera.position.z = Math.clamp(camera.position.z, -2500, 2500);
    requestAnimationFrame(render)
    object_controls.update();
    var delta = clock.getDelta();

    animator.update(delta);

    if (picked_object !== undefined && picked_object.userData !== undefined) {
        var collided = false;
        connection_a_made = false;
        connection_b_made = false;
        for (var i = 0; i < picked_object.userData.length; ++i) {
            picked_object.userData[i].setFromObject(picked_object.children[i+1], picked_object);
            for (var j = 0; j < bounding_boxes.length; ++j) {
                if (picked_object.userData[i] !== bounding_boxes[j]) {
                    var obj1 = picked_object.userData[i].userData;
                    var obj2 = bounding_boxes[j].userData;
                    if (picked_object.userData[i].intersectsBox(bounding_boxes[j])) {

                        collided = true;

                        o1 = obj1;
                        o2 = obj2;

                        if (collidedPort1a === o1)
                            connection_a_made = true;

                        if (collidedPort1b === o2) 
                            connection_b_made = true;

                    }
                }
            }
        }
        countCollision = collided;

        if (countCollision) {
            object_controls.visible = false;
            currCollisionTime += delta;

            collSphere.position.set(picked_object.position.x + o1.x, picked_object.position.y + o1.y,0);
            collSphere.visible = true;
            var scl = 3 + (6 * (currCollisionTime / collisionTime));
            collSphere.scale.set(scl, scl, scl);

            if (currCollisionTime >= collisionTime) {
                currCollisionTime = 0.0;
                recalc = true;

                if (collidedPort1a === undefined && !connection_a_made) {
                    console.error("CONNECTED 1/2 PORTS");
                    collidedPort1a = o1;
                    collidedPort2a = o2;
                } else if (collidedPort1b === undefined && !connection_a_made && !connection_b_made) {
                    console.error("CONNECTED 2/2 PORTS");
                    collidedPort1b = o1;
                    collidedPort2b = o2;
                }
            }
        } else {
            countCollision = 0.0;
            collSphere.visible = false;
            object_controls.visible = true;
        } 
    }

    renderer.render(scene, camera);
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
        if (initTouch !== undefined && initTouch.x == pos.x && initTouch.y == pos.y) {

            var raycaster = new THREE.Raycaster();
            camera.updateProjectionMatrix();
            raycaster.setFromCamera(input.getTouchCenterized(), camera);
            var intersects = raycaster.intersectObjects(scene.children, true);
            var raycastHit = false;
            for (var i = 0; i < intersects.length; ++i) {
                if (intersects[i].object.name.name === "pickable") {
                    picked_object = intersects[i].object;

                    if (display_graph)
                        while(picked_object.parent !== undefined && picked_object.parent.type !== "Scene")
                            picked_object = picked_object.parent;

                        attach(picked_object);



                        raycastHit = true;

                        break;
                    }
                } 
                if (!raycastHit)
                    detach();

            }
            initTouch = undefined;
        }

    }).on('mousemove', function(event) {
        if (mouseDown)
            mouseMoved = true;
    }).on('mouseup', function() {
        if (!mouseMoved) {
            var raycaster = new THREE.Raycaster();
            camera.updateProjectionMatrix();
            raycaster.setFromCamera(input.getMouseCenterized(), camera);
            var intersects = raycaster.intersectObjects(scene.children, true);
            var raycastHit = false;

            for (var i = 0; i < intersects.length; ++i) {
                if (intersects[i].object.name.name === "pickable") {

                    if (picked_object !== undefined) {
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
            }
            mouseDown = false;
            mouseMoved = false;

            if (recalc) {

                recalc = false;
//parsed_graph.children = [];
//de.cau.cs.kieler.portSide
if (collidedPort1a !== undefined && collidedPort2a !== undefined) {

    parsed_graph.edges.push({
        id:"id" + newId++,
        source:collidedPort1a.source,
        sourcePort:collidedPort1a.id,
        target:collidedPort2a.source,
        targetPort:collidedPort2a.id
    });

}
if (collidedPort1b !== undefined && collidedPort2b !== undefined) {

    parsed_graph.edges.push({
        id:"id" + newId++,
        source:collidedPort1b.source,
        sourcePort:collidedPort1b.id,
        target:collidedPort2b.source,
        targetPort:collidedPort2b.id
    });

}

var obj = {
    class:picked_object.name.class,
    height:30,
    properties: {"de.cau.cs.kieler.portConstraints": "FIXED_SIDE"},
    id:picked_object.name.id,
    ports:[],
    width:30
};

for(var i = 1; i < picked_object.children.length - 1; ++i) {
    obj.ports.push({
        class:picked_object.children[i].userData.class,
        height:3,
        id:picked_object.children[i].userData.id,
        properties:picked_object.children[i].userData.properties,
        with: 3
    })
}

parsed_graph.children.push(obj);
detach();    
clearScene();
camera_controls.reset();
calculate_graph(JSON.stringify(parsed_graph));
}
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
})

    $('#file').change( function(e) {
        var file = e.target.files[0];
        if (file !== undefined) {
            fileReader.onload = function(readFile) {
                playButton.classList.add("disabled");
                pauseButton.classList.add("disabled");
                stopButton.classList.add("disabled");

                var result = fileReader.result;
                var success = false;
                try {
                    var parsed_result = JSON.parse(result);
                    success = true;
                    console.log(parsed_result);
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
                else if (parsed_result.hasOwnProperty("id")) {
                    object_controls.detach();
                    clearScene();
                    graph = result;
                    parsed_graph = parsed_result;
                    calculate_graph(graph);
                    console.log("Graph loaded");
                }
                else if (parsed_result.length > 0 || parsed_result.hasOwnProperty("children")) {
                    object_controls.detach();
                    clearScene();
                    graph = parsed_graph = result;
                    display_graph(graph);
                    console.log("Ready graph loaded");
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

// parsed_graph = parsed_graph

};
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

            console.log(obj.material);

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

            picked_object.userData = {};
            var c = picked_object.clone();
            picked_object.userData = copy;
            c.position.y += 10;
            c.position.x += 10;

            c.name.id = c.name.id[0] + newId++;
            for (var i = 1; i < c.children.length - 1; ++i) {
                c.children[i].name.id = c.name.id;
                c.children[i].userData.id = c.name.id[0] + (newId-1) + newPortId++;
                c.children[i].userData.source = c.name.id;
            }

            c.userData = [];
            for (var i = 0; i < copy.length; ++i) {
                var box = new THREE.Box3().setFromObject(c.children[i + 1]);
                box.userData = c.children[i + 1].userData;
                c.userData.push(box);
            }

            c.remove(c.children[c.children.length - 1]);
            c.add(text(c.name.id,0,0));

            scene.add(c);
            picked_object = c;
            object_controls.attach(c);
        }
    };

    Array.prototype.removeValue = function(name, value){
        var array = $.map(this, function(v,i){
            return v[name] === value ? null : v;
        });
        this.length = 0;
        this.push.apply(this, array);
    }

    deleteButton.onclick = function() {
        var edgesToDelete = [];
        for (var i = 0; i < parsed_graph.edges.length; ++i) {
            if (parsed_graph.edges[i].source === picked_object.name.id ||
                parsed_graph.edges[i].target === picked_object.name.id)
                edgesToDelete.push(parsed_graph.edges[i]);
        }
        for (var i = 0; i < edgesToDelete.length; ++i)
            parsed_graph.edges.removeValue("id",edgesToDelete[i].id);

        parsed_graph.children.removeValue("id", picked_object.name.id);

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

        w = window.innerWidth;
        h = window.innerHeight * 0.85;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize( w, h );

    }, false);

    resetCameraButton.onclick = function() {
        camera_controls.reset();
    };
});