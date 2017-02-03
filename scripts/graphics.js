$(function() {
  var grabbing_graph = false;
  var graph;
  var scene = new THREE.Scene();
  var w = window.innerWidth;
  var h = 600;

  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xEEEEEE, 1 );
  renderer.setSize(w, h);


  var minZoom = 0.1;
  //var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  var camera = new THREE.OrthographicCamera(w/-2, w/2, h/2, h/-2, 0.1, 1000);
  camera.position.z = 400;

  var omx = 0;
  var omy = 0;
  var dmx = 0;
  var dmy = 0;

  function render() {

    if (grabbing_graph) {
        camera.position.x -= dmx / camera.zoom;
        camera.position.y += dmy / camera.zoom;
        dmx = dmy = 0;
    }

    requestAnimationFrame(render)
    renderer.render(scene, camera);
  }

  $('#glcontainer').on('mousedown', function(event) {
    grabbing_graph = true;
  }).bind('DOMMouseScroll mousewheel', function(event) {
    camera.zoom -= event.originalEvent.wheelDelta / 500;
    if (camera.zoom < minZoom) camera.zoom = minZoom;
    camera.updateProjectionMatrix();
  }).append(renderer.domElement);
  render();

  $(document).on('mouseup', function() {
    grabbing_graph = false;
  }).on('mousemove', function(event) {
    var mx = event.clientX;
    var my = event.clientY;
    dmx = mx - omx;
    dmy = my - omy;
    omx = mx;
    omy = my;
  });

	$('#layout').click(function() {
    if(graph === undefined) {
      alert("no diagram chosen!");
      return;
    }
    display_graph(graph, scene);
  });

  $('#files').change(
  function(e) {
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.onload = (function(readFile) {
    return function(e) {
      graph = reader.result;
    };
  })(file);
  reader.readAsBinaryString(file);
  });

});