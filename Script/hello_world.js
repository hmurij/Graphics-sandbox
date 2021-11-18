"use strict";

// glm.$DEBUG=false;
// console.log(glm);
// console.log('loaded glm-js version: ', glm.version);
// console.log('vec3 example: ', glm.mat4(1.0));

glm.GLMAT.glMatrix.setMatrixArrayType(Array);
// var mat = glm.GLMAT.mat4.create();
// console.log(mat);

// test glMatrix
// setMatrixArrayType(Array);
// var mat = mat4.create();
// console.log(glMatrix.glMatrix.setMatrixArrayType);

// setMatrixArrayType(Array);
//glMatrix.setMatrixArrayType(Array);
//
// var mat = glMatrix.mat4.create();
// console.log(mat);
//
// glMatrix.glMatrix.setMatrixArrayType(Array);
//
// var mat1 = glMatrix.mat4.create();
// console.log(mat1);


// init canvas width and height
const c = document.getElementById("myCanvas");
if (window.innerWidth >= 768) {
    c.width = window.innerWidth * 0.6 - 12;
    c.height = window.innerWidth * 0.6 - 12;

    if(window.innerWidth >= 1505){

      c.width = window.innerHeight - 46 - 9;
      c.height = window.innerHeight - 46 - 9;
    }

} else {
    c.width = window.innerWidth - 12;
    c.height = window.innerWidth - 12;
  // c.style.marginLeft = window.innerWidth * 0.05 + "px";
}

// pointer lock object forking for cross browser
c.requestPointerLock = c.requestPointerLock ||
                       c.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;

// set up later for ctrl+c combo on leave it at mouse click on canvas
c.onclick = function() { c.requestPointerLock(); };

// set up requestAnimationFrame
window.requestAnimationFrame = window.requestAnimationFrame
     || window.mozRequestAnimationFrame
     || window.webkitRequestAnimationFrame
     || window.msRequestAnimationFrame
     || function (f) { return setTimeout(f, 1000 / 60); }; // simulate calling code 60

// request webGL context
const gl = c.getContext("webgl");

// If we don't have a GL context, give up now

if (!gl) {
  alert('Unable to initialize WebGL. Your browser or machine may not support it.');
  // return;
}

// set up webGL parameters
// gl.enable(gl.CULL_FACE);
// gl.cullFace(gl.BACK);
gl.enable(gl.DEPTH_TEST);           // Enable depth testing
gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

console.log("webGL version: " + gl.getParameter(gl.VERSION) +
     "\nShading language version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION) +
     "\nRenderer: " + gl.getParameter(gl.RENDERER) +
     "\nVendor: " + gl.getParameter(gl.VENDOR));
     // "\nALIASED_POINT_SIZE_RANGE: " + gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE));

// gl.viewport(0, 0, c.width, c.height);

main();

async function main() {

  // set up view camera
  // var camera_pos   = [0.0, 0.0, 3.0];
  // var camera_front = [0.0, 0.0, -1.0];
  // var camera_up    = [0.0, 1.0, 0.0];
  var camera_pos   = glm.vec3(-4.4, 0.3, 2.0);
  var camera_front = glm.vec3(0.0, 0.0, -1.0);
  var camera_up    = glm.vec3(0.0, 1.0, 0.0);

  // var lastX = c.width, lastY = c.height;
  // var yaw   = -90.0;	// yaw is initialized to -90.0 degrees since a yaw of 0.0 results in a direction vector pointing to the right so we initially rotate a bit to the left.
  // var pitch =  0.0;
  var camera = new Camera(camera_pos, camera_up, camera_front, 0.0, -35.0);

  // Hello World!
  // Initiate character models
  var str = "HelloWorld!";
  var character_models = [];
  for(let index = 0; index < str.length; index++){
    // console.log(str[index]);
    character_models.push(new Model("Objects/Characters/" + str[index] +".obj", "Shader/model.glsl"));
    await character_models[index].init();
    character_models[index].setColor(glm.vec3(0.82, 0.68, 0.21));
  } // end of for

  
  // set up character positions
  character_models[0].setPosition(glm.vec3(-2.5, 0.0, 0.0)); // H
  character_models[1].setPosition(glm.vec3(-1.9, 0.0, 0.0)); // e
  character_models[2].setPosition(glm.vec3(-1.55, 0.0, 0.0)); // l
  character_models[3].setPosition(glm.vec3(-1.35, 0.0, 0.0)); // l
  character_models[4].setPosition(glm.vec3(-0.97, 0.0, 0.0)); // o
  character_models[5].setPosition(glm.vec3(-0.0, 0.0, 0.0)); // W
  character_models[6].setPosition(glm.vec3(0.7, 0.0, 0.0)); // o
  character_models[7].setPosition(glm.vec3(1.18, 0.0, 0.0)); // r
  character_models[8].setPosition(glm.vec3(1.45, 0.0, 0.0)); // l
  character_models[9].setPosition(glm.vec3(1.78, 0.0, 0.0)); // d
  character_models[10].setPosition(glm.vec3(2.15, 0.0, 0.0)); // !


  // const cube_model = new Model("Objects/cube.obj");
  // await cube_model.init();
  //
  // const plane_model = new Model("Objects/plane.obj");
  // await plane_model.init();

  //cube_model.setPosition(glm.vec3(2.5, 0.0, -10.0));
  //
  // const triangle_model = new Model("Objects/equilateral_triangle.obj");
  // await triangle_model.init();
  // triangle_model.setPosition(glm.vec3(-2.5, 0.0, -10.0));

  // const hello_world = new Model("Objects/hello_world.obj");
  // await hello_world.init();

  window.requestAnimationFrame(animationLoop);

  var current_time = 0;
  var delta_time = 0;
  var counter = 0;
  var fps = document.getElementById("fps");
  var angle = 0;
  const rotation_speed = Math.PI / 4;

  // var model_matrix = glm.GLMAT.mat4.create();
  // var view_matrix = glm.GLMAT.mat4.create();
  // var model_matrix = glm.mat4(1.0);
  // var view_matrix = glm.mat4(1.0);
  var light_source_position = glm.vec3(0.0, 5.0, 30.0);
  var light_source_color = glm.vec3(0.8);

  var time_stamp = 0;

  // var start_time = 0;
  // var stop_time = 0;

  function animationLoop(time_stamp) {

    // start_time = performance.now();
    // console.log("start: " + start_time);

    delta_time = time_stamp - current_time;
    current_time = time_stamp;

    counter++;
    if(counter == 10){
      fps.innerHTML = "FPS: " + (1000 / delta_time).toFixed(2);

      counter = 0;
    }

    // angle = 2 * Math.PI - (time_stamp / 2000) % (2 * Math.PI);
    angle += rotation_speed * (delta_time * 0.001);

    // gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // light_source_position = glm.vec3(Math.sin(angle) * 50, 2.0, Math.cos(angle) * 50);

    // view_matrix = glm.lookAt(camera_pos, camera_pos['+'](camera_front), camera_up);
    // view_matrix = camera.getViewMatrix();
    // view_matrix_array = glm.GLMAT.mat4.lookAt(view_matrix_array, camera_pos1, (camera_pos['+'](camera_front)).array, camera_up1);
    // view_matrix = glm.GLMAT.mat4.lookAt(view_matrix, camera_pos, glm.GLMAT.vec3.add([0, 0, 0], camera_pos, camera_front), camera_up);
    // cube_model.setViewMatrix(camera.getViewMatrix());
    // cube_model.setVeiwPosition(camera.getPosition());

    for(let character_model of character_models){
      character_model.setViewMatrix(camera.getViewMatrix());
      character_model.setVeiwPosition(camera.getPosition());
      character_model.setRotation(angle, glm.vec3(0.0, 1.0, 0.0));
      character_model.setLightColor(light_source_color);
      character_model.setLightSourcePosition(light_source_position);

      character_model.render();

    } // end of for

    // character_models[0].render();





    // cube_model.setPosition(glm.vec3((Math.sin(angle) * 2), 0.0, -3.0));
    // cube_model.setPosition(glm.vec3(0.0, 2.0, -3.0));
    // cube_model.setPosition(glm.vec3(Math.sin(angle) * 2, 0.0, -3.0));
    // cube_model.setPosition([Math.sin(angle) * 2, 0.0, -3.0]);
    // cube_model.setPosition(glm.vec3(0.0, 0.0, -3.0));
    // cube_model.setRotation(angle, [0.0, 1.0, 1.0]);
    // cube_model.setRotation(angle, glm.vec3(0.0, 1.0, 0.0));
    // cube_model.setColor(glm.vec3(0.82, 0.68, 0.21));
    // cube_model.setLightColor(light_source_color);
    // cube_model.setLightSourcePosition(light_source_position);
    // cube_model.render(time_stamp);
    // triangle_model.render(time_stamp);
    // hello_world.setPosition(glm.vec3(0.0, 0.0, -8.0 + (Math.sin(angle) * 2 - 2)));
    // hello_world.setRotation(angle, glm.vec3(0.0, 0.0, 1.0));
    // hello_world.render(time_stamp);

    // plane_model.setViewMatrix(camera.getViewMatrix());
    // plane_model.setVeiwPosition(camera.getPosition());
    // plane_model.setScale(glm.vec3(10.0));
    // plane_model.setRotation(0, glm.vec3(0.0, 0.0, 0.0));
    // plane_model.setPosition(glm.vec3(0.0, 0.0, 0.0));
    // plane_model.setColor(glm.vec3(0.8));
    // plane_model.setLightColor(light_source_color);
    // plane_model.setLightSourcePosition(light_source_position);
    // plane_model.render(time_stamp);

    // stop_time = performance.now();
    // console.log("stop: " + stop_time);


    window.requestAnimationFrame(animationLoop);

  } // end of animationLoop

  // pointer lock event listeners
  // Hook pointer lock state change events for different browsers
  document.addEventListener('pointerlockchange', lockChangeAlert, false);
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

  function lockChangeAlert() {
    if (document.pointerLockElement === c ||
      document.mozPointerLockElement === c) {
        // console.log('The pointer lock status is now locked');
        document.addEventListener("mousemove", updatePosition, false);
        window.addEventListener('keypress', processInput);
      } else {
        // console.log('The pointer lock status is now unlocked');
        document.removeEventListener("mousemove", updatePosition, false);
        window.removeEventListener('keypress', processInput);
      }
    } // end of lockChangeAlert

    function updatePosition(e) {
      // console.log(e.movementX + " : " + e.movementY);

      camera.processMouseInput(e);

      // var sensitivity = 0.025;
      //
      // var x_offset = e.movementX * sensitivity;
      // var y_offset = e.movementY * sensitivity;
      //
      // yaw += x_offset;
      // pitch -= y_offset;
      //
      // // make sure that when pitch is out of bounds, screen doesn't get flipped
      // if (pitch > 89.0)
      //   pitch = 89.0;
      // if (pitch < -89.0)
      //   pitch = -89.0;
      //
      // var front = glm.vec3();
      // front.x = Math.cos(glm.radians(yaw)) * Math.cos(glm.radians(pitch));
      // front.y = Math.sin(glm.radians(pitch));
      // front.z = Math.sin(glm.radians(yaw)) * Math.cos(glm.radians(pitch));
      // camera_front = glm.normalize(front);

    } // end of updatePosition

  // set up listener for window keyboard input while mouse over canvas
  function processInput(key_event) {
    // console.log(key_event.keyCode);
    // console.log(delta_time);

    camera.processKeyboardInput(key_event, delta_time);

    // var camera_speed = 1.0 * (delta_time / 1000);
    //
    // // if W pressed keyCode = 119
    // if(key_event.keyCode == 119){
    //   // console.log("pressing W");
    //   // glm.GLMAT.vec3.add(camera_pos, camera_pos, glm.GLMAT.vec3.mul([0, 0, 0], camera_front, [camera_speed, camera_speed, camera_speed]));
    //   camera_pos['+='](camera_front['*'](camera_speed));
    // } // end of if
    //
    // // if S pressed keyCode = 115
    // if(key_event.keyCode == 115){
    //   // console.log("pressing S");
    //   // glm.GLMAT.vec3.sub(camera_pos, camera_pos, glm.GLMAT.vec3.mul([0, 0, 0], camera_front, [camera_speed, camera_speed, camera_speed]));
    //   camera_pos['-='](camera_front['*'](camera_speed));
    // } // end of if
    //
    // // if A pressed keyCode = 97
    // if(key_event.keyCode == 97){
    //   // console.log("pressing A");
    //   camera_pos['-='](glm.normalize(glm.cross(camera_front, camera_up))['*'](camera_speed));
    // } // end of if
    //
    // // if D pressed keyCode = 100
    // if(key_event.keyCode == 100){
    //   // console.log("pressing D");
    //   camera_pos['+='](glm.normalize(glm.cross(camera_front, camera_up))['*'](camera_speed));
    // } // end of if

  } // end of processInput

  // c.addEventListener('mouseover', function() {
  //   // console.log("mouse over canvas");
  //   window.addEventListener('keypress', processInput);
  // });
  //
  // c.addEventListener('mouseout', function() {
  //   // console.log("mouse outside canvas");
  //   window.removeEventListener('keypress', processInput);
  // });

  // set up listeners for resising
  window.addEventListener('resize', resizeCanvas, false);
  // window.addEventListener('orientationchange', resizeCanvas, false);
  resizeCanvas();


  function resizeCanvas() {
    if(window.innerWidth >= 768){
      c.width = c.height = (window.innerWidth * 0.6 - 12 < window.innerHeight - 46 - 9 ?
        window.innerWidth * 0.6 - 12 : c.width = window.innerHeight - 46 - 9);

    } else {
      c.width = c.height = window.innerWidth - 12;
    }

    gl.viewport(0, 0, c.width, c.height);
    // update projection in class if required
  } // end of function resizeCanvas()

} // end of main
