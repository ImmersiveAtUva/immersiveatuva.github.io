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


// Create a three.js camera.
function init_camera() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  // Create a reticle
  var reticle = new THREE.Mesh(
    new THREE.RingBufferGeometry(0.005, 0.01, 15),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
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
init_font_loader();
function init_images(){
  loader = new THREE.TextureLoader();
  loader.load('img/box.jpg', function (texture) {
    var geometry = new THREE.BoxGeometry(boxWidth, 0.1, boxWidth);
    var material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide
    });
    var floor = new THREE.Mesh(geometry, material);
    floor.position.set(0,-1,0);
    scene.add(floor);
  });
  load_image("img/vr.png", new THREE.Vector3(0,0,-2));
  load_image("img/projects.png", new THREE.Vector3(0,0,2));
  load_image("img/contact.png", new THREE.Vector3(2,0,0));
  load_image("img/meeting_times.png", new THREE.Vector3(-2,0,0));
}

function load_image(path, pos,scalefactor=500){
  loader.load(path, function(texture){
    texture1 = texture;
    var h = texture.image.height;
    var w = texture.image.width;

    var geometry = new THREE.PlaneGeometry(w/scalefactor, h/scalefactor);
    var material = new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide});
    var mesh = new THREE.Mesh(geometry, material);

    // set the position of the image mesh in the x,y,z dimensions
    mesh.position.add(pos);
    mesh.lookAt(0,0,0);
    scene.add(mesh);
  });
}
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
