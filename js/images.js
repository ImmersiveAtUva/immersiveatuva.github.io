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
  load_image("img/vr.png", new THREE.Vector3(0,0,-2),false, "", 500);
  load_image("img/projects.png", new THREE.Vector3(0,0.5,2));
  load_image("img/github.png", new THREE.Vector3(0,0.1,2), true, "https://github.com/ImmersiveAtUva/immersive-dev-project");
  load_image("img/meeting_times.png", new THREE.Vector3(-2,0,0));
  load_image("img/contact.png", new THREE.Vector3(2,0.5,0));
  load_image("img/email.png", new THREE.Vector3(2,0.1,0), true, "mailto:immersive@virginia.edu");
  load_image("img/fb.png", new THREE.Vector3(2,-0.25,0), true, "https://www.facebook.com/ImmersiveUVA");


}

function load_image(path, pos,redirect=false,url="",scalefactor=300){
  
  loader.load(path, function(texture){
    texture1 = texture;
    var h = texture.image.height;
    var w = texture.image.width;

    var geometry = new THREE.PlaneGeometry(w/scalefactor, h/scalefactor);
    var material = new THREE.MeshBasicMaterial({map: texture, side:THREE.DoubleSide});
    var mesh = new THREE.Mesh(geometry, material);

    // set the position of the image mesh in the x,y,z dimensions
    mesh.name = path;
    mesh.position.add(pos);
    mesh.lookAt(0,0,0);
    mesh.userData.redirect = redirect;
    mesh.userData.url = url;
    scene.add(mesh);
    img_obj_list.push(mesh);

  });
}