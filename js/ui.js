var uifont;
/**
 * Loads a font. Note this is async and must load completely
 * before creating text from the font
 */
function init_font_loader(){
	var loader = new THREE.FontLoader();
	var geometry;
	loader.load( 'res/VT323_Regular.json', function ( font ) {
		//font is loaded
		uifont = font;
		create_HUD("immersive");
		create_title();
		return uifont;
	});
	
}
/**
 * @param uicolor the color of the material
 * @returns a mesh with a certain color and a text geometry
 */
function create_text_mesh(text, textsize = 0.05, uicolor = "#000000", h= 0.01){
	var text_geometry = create_text_geometry(text, textsize,h);
	var text_material = new THREE.MeshBasicMaterial({color: uicolor});
	var text_mesh = new THREE.Mesh( text_geometry, text_material);
	text_mesh.receiveShadow = true;
	text_mesh.castShadow = true;
	return text_mesh;
}
/**
 * @returns text geometry with given size
 */
function create_text_geometry(text, textsize, h){
	var text_geom = new THREE.TextGeometry( text, {
		font: uifont,	//the already loaded font
		size: textsize,
		height: h,
		curveSegments: 2,
		bevelEnabled: false
	} );
	return text_geom;
}
/**
 * Makes title
 */
function create_title(){
	var title_mesh = create_text_mesh("immersive@uva", 1, "#ff0000", .1);
	title_mesh.lookAt(0,0,0);
	title_mesh.position.set(-3.5,1.6,-2.2);
	scene.add(title_mesh);

	var subtitle = create_text_mesh("hover over buttons to follow them", 0.25, "#ff0000", .01);
	subtitle.lookAt(0,0,0);
	subtitle.position.set(-2,1,-2.2);
	scene.add(subtitle);
}
/**
 * Makes text at a good distance for HUDs
 */
function create_HUD(text){
	var text_mesh = create_text_mesh(text, 0.05, "#ff0000");
	text_mesh.rotation.x = 3.14/6;
	camera.add(text_mesh);
	text_mesh.position.set(0.1, 0.25, -0.4);
}