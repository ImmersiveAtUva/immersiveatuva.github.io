// Get config from URL
var config = (function() {
  var config = {};
  var q = window.location.search.substring(1);
  if (q === '') {
    return config;
  }
  var params = q.split('&');
  var param, name, value;
  for (var i = 0; i < params.length; i++) {
    param = params[i].split('=');
    name = param[0];
    value = param[1];

    // All config values are either boolean or float
    config[name] = value === 'true' ? true :
                   value === 'false' ? false :
                   parseFloat(value);
  }
  return config;
})();

polyfill = new WebVRPolyfill(config);

console.log("Using webvr-polyfill version " + WebVRPolyfill.version +
            " with configuration: " + JSON.stringify(config));
renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

// Append the canvas element created by the renderer to document body element.
canvas = renderer.domElement;
document.body.appendChild(canvas);
init();
function init(){
  init_scene();
  init_camera();
  init_font_loader();
  init_images();
}

// Create a three.js scene.
function init_scene() {
  scene = new THREE.Scene();
  //a pleasing sky blue
  scene.background = new THREE.Color( 0x42c5f4 );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.1 );
  directionalLight.position.set(0,3,0);
  directionalLight.lookAt(0,0,0);
  scene.add( directionalLight );
}

function getIntersections() {
  cam_mat.identity().extractRotation(camera.matrixWorld );
  raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
  raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( cam_mat );
  return raycaster.intersectObjects( img_obj_list );
}

function check_vr_click(){
  firstobj = getIntersections()[0];
  // console.log(firstobj);
  if(firstobj !== undefined){
    if(selected_obj === undefined){

      setTimeout(function(){ request_redirect(firstobj); }, 3000);
      selected_obj = firstobj;
    }
    if(firstobj.object.name !== selected_obj.object.name){
      console.log("New obj selected");
      setTimeout(function(){ request_redirect(firstobj); }, 3000);
      selected_obj = firstobj;
    }
    camera.userData.reticle.material.color.setHex( 0xff1100 ); 
  }
  else{
    selected_obj = firstobj;
    camera.userData.reticle.material.color.setHex( 0x000000 ); 

  }
}
function request_redirect(img_obj){
  if(img_obj!==undefined){
    console.log(img_obj.object.name);
    console.log(selected_obj.object.name);
    if(img_obj.object.name === selected_obj.object.name){
      if(img_obj.object.userData.redirect){
        window.location.href = img_obj.object.userData.url;
      }
      else{
        console.log("I would have redirected but the img doesn't tell me to.");
      }
      
    }
  }
}
// Create a three.js camera.
function init_camera() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  // Create a reticle
  var reticle = new THREE.Mesh(
    new THREE.RingBufferGeometry(0.005, 0.01, 15),
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.5 })
  );
  reticle.position.z = -0.5;
  camera.add(reticle);
  camera.position.set(0,0,1);
  scene.add(camera);
  camera.userData.reticle = reticle;
}

var texture1;
// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(canvas.clientWidth, canvas.clientHeight, false);

var vrDisplay, controls;

// Add a repeating grid as a skybox.
var boxWidth = 5;
// Load the skybox texture


// The polyfill provides this in the event this browser
// does not support WebVR 1.1
navigator.getVRDisplays().then(function (vrDisplays) {
  // If we have a native display, or we have a CardboardVRDisplay
  // from the polyfill, use it
  if (vrDisplays.length) {
    vrDisplay = vrDisplays[0];

    // Apply VR headset positional data to camera.
    controls = new THREE.VRControls(camera);

    // Kick off the render loop.
    vrDisplay.requestAnimationFrame(animate);
  }
  // Otherwise, we're on a desktop environment with no native
  // displays, so provide controls for a monoscopic desktop view
  else {
    controls = new THREE.OrbitControls(camera);
    controls.keyPanSpeed = 80;
    controls.target.set(0, 0, 0);

    // Disable the "Enter VR" button
    var enterVRButton = document.querySelector('#vr');
    enterVRButton.disabled = true;

    // Kick off the render loop.
    requestAnimationFrame(animate);
  }
});

// Request animation frame loop function
var lastRender = 0;
function animate(timestamp) {
  var delta = Math.min(timestamp - lastRender, 500);
  lastRender = timestamp;

  

  // Update VR headset position and apply to camera.
  controls.update();
  
  check_vr_click();
  // Render the scene.
  effect.render(scene, camera);

  // Keep looping; if using a VRDisplay, call its requestAnimationFrame,
  // otherwise call window.requestAnimationFrame.
  if (vrDisplay) {
    vrDisplay.requestAnimationFrame(animate);
  } else {
    requestAnimationFrame(animate);
  }
}

function onResize() {
  // The delay ensures the browser has a chance to layout
  // the page and update the clientWidth/clientHeight.
  // This problem particularly crops up under iOS.
  if (!onResize.resizeDelay) {
    onResize.resizeDelay = setTimeout(function () {
      onResize.resizeDelay = null;
      console.log('Resizing to %s x %s.', canvas.clientWidth, canvas.clientHeight);
      effect.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }, 250);
  }
}

function onVRDisplayPresentChange() {
  console.log('onVRDisplayPresentChange');
  onResize();
  buttons.hidden = vrDisplay.isPresenting;
}

function onVRDisplayConnect(e) {
  console.log('onVRDisplayConnect', (e.display || (e.detail && e.detail.display)));
}

// Resize the WebGL canvas when we resize and also when we change modes.
window.addEventListener('resize', onResize);
window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);
window.addEventListener('vrdisplayconnect', onVRDisplayConnect);

// Button click handlers.
document.querySelector('button#fullscreen').addEventListener('click', function() {
  enterFullscreen(renderer.domElement);
});
document.querySelector('button#vr').addEventListener('click', function() {
  vrDisplay.requestPresent([{source: renderer.domElement}]);
});

function enterFullscreen (el) {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
}
