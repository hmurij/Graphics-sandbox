"use strict";

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

// enable WEBGL_depth_texture extension
const ext = gl.getExtension('WEBGL_depth_texture');
if (!ext) {
  alert('need WEBGL_depth_texture');
} // end of if

// set up webGL parameters
// gl.enable(gl.CULL_FACE);
// gl.cullFace(gl.BACK);
gl.enable(gl.DEPTH_TEST);           // Enable depth testing
gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

const alignment = 1;
gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);

console.log("webGL version: " + gl.getParameter(gl.VERSION) +
     "\nShading language version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION) +
     "\nRenderer: " + gl.getParameter(gl.RENDERER) +
     "\nVendor: " + gl.getParameter(gl.VENDOR) +
     "\nNumber of texture units: " + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) +
     "\nNumber of texture units vertex shader: " + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) +
     "\nNumber of texture units fragment shader: " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) +
     "\nUNPACK_ALIGNMENT value: " + gl.getParameter(gl.UNPACK_ALIGNMENT)
   );
     // "\nALIASED_POINT_SIZE_RANGE: " + gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE));

// gl.viewport(0, 0, c.width, c.height);

main();

async function main() {

  var camera_pos   = glm.vec3(0.0, 0.0, 10.0);
  var camera_front = glm.vec3(0.0, 0.0, -1.0);
  var camera_up    = glm.vec3(0.0, 1.0, 0.0);

  // var lastX = c.width, lastY = c.height;
  // var yaw   = -90.0;	// yaw is initialized to -90.0 degrees since a yaw of 0.0 results in a direction vector pointing to the right so we initially rotate a bit to the left.
  // var pitch =  0.0;
  // var camera = new Camera(camera_pos, camera_up, camera_front, 0.0, -90.0);
  var camera = new Camera(camera_pos, camera_up, camera_front);

  const model = new Model("Objects/cube.obj", "Shader/texture.glsl");
  await model.init();

  // Create a texture. Create and initialize a WebGLTexture object
  var texture = gl.createTexture();
  // Bind a given WebGLTexture to a target (binding point).
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Fill the texture with a 1x1 blue pixel. Specify a two-dimensional texture image.
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
  //   new Uint8Array([0, 0, 255, 255]));

  // fill texture with 3x2 pixels
  const level = 0;
  const internalFormat = gl.LUMINANCE;
  const width = 3;
  const height = 2;
  const border = 0;
  const format = gl.LUMINANCE;
  const type = gl.UNSIGNED_BYTE;
  const data = new Uint8Array([
    128,  64, 128,
    0, 192,   0
    // 20, 200, 20, 200, 20, 200, 20, 200,
    // 200, 20, 200, 20, 200, 20, 200, 20,
    // 20, 200, 20, 200, 20, 200, 20, 200,
    // 200, 20, 200, 20, 200, 20, 200, 20,
    // 20, 200, 20, 200, 20, 200, 20, 200,
    // 200, 20, 200, 20, 200, 20, 200, 20,
    // 20, 200, 20, 200, 20, 200, 20, 200,
    // 200, 20, 200, 20, 200, 20, 200, 20,
    // 200, 20, 200, 20,
    // 20, 200, 20, 200,
    // 200, 20, 200, 20,

  ]);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
    format, type, data);

  // set the filtering so we don't need mips and it's not filtered
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

  // Asynchronously load an image
  // var image = new Image();
  // image.src = "Textures/f-texture.png";
  // image.addEventListener('load', function() {
  //   // Now that the image has loaded make copy it to the texture.
  //   gl.bindTexture(gl.TEXTURE_2D, texture);
  //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
  //   gl.generateMipmap(gl.TEXTURE_2D);
  // });

  // create texture to render to
  const targetTextureWidth = 256;
  const targetTextureHeight = 256;
  const targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);

  {
    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      targetTextureWidth, targetTextureHeight, border,
      format, type, data);

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // Create and bind the framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

  // create a depth renderbuffer
  const depthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

  // make a depth buffer and the same size as the targetTexture
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

  window.requestAnimationFrame(animationLoop);

  var current_time = 0;
  var delta_time = 0;
  var counter = 0;
  var fps = document.getElementById("fps");
  var angle = 0;
  const rotation_speed = Math.PI / 4;

  var light_source_position = glm.vec3(0.0, 5.0, 30.0);
  var light_source_color = glm.vec3(0.8);

  var time_stamp = 0;

  function animationLoop(time_stamp) {

    delta_time = time_stamp - current_time;
    current_time = time_stamp;

    counter++;
    if(counter == 5){
      fps.innerHTML = "FPS: " + (1000 / delta_time).toFixed(2);

      counter = 0;
    }

    // angle = 2 * Math.PI - (time_stamp / 2000) % (2 * Math.PI);
    angle += rotation_speed * (delta_time * 0.001);

    // render to our targetTexture by binding the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // render cube with our 3x2 texture
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);

    // Clear the attachment(s).
    gl.clearColor(0, 0, 1, 1);   // clear to blue
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

    // gl.clearColor(0.8, 0.8, 0.8, 1.0);
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // gl.clearDepth(1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // light_source_position = glm.vec3(Math.sin(angle) * 50, 2.0, Math.cos(angle) * 50);

    model.setViewMatrix(glm.mat4(1.0));
    model.setVeiwPosition(camera.getPosition());
    // plane_model.setScale(glm.vec3(10.0));
    model.setPosition(glm.vec3(0.0, 0.0, -10.0));
    model.setRotation(angle, glm.vec3(0.0, 0.0, 0.0));
    // plane_model.setColor(glm.vec3(0.8));
    model.setLightColor(light_source_color);
    model.setLightSourcePosition(light_source_position);
    model.render(time_stamp);

    model.setPosition(glm.vec3(0.0, 1.8, -10.0));
    model.setRotation(angle, glm.vec3(0.3, 0.8, 0.0));
    model.render(time_stamp);

    model.setPosition(glm.vec3(0.0, -1.8, -10.0));
    model.setRotation(-angle, glm.vec3(0.3, 0.8, 0.0));
    model.render(time_stamp);

    // render to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // render the cube with the texture we just rendered to
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, c.width, c.height);

    // Clear the canvas AND the depth buffer.
    gl.clearColor(1, 1, 1, 1);   // clear to white
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    model.setViewMatrix(camera.getViewMatrix());
    model.setPosition(glm.vec3(0.0, 0.0, 0.0));
    model.setRotation(angle, glm.vec3(0.0, 0.0, 0.0));
    // plane_model.setColor(glm.vec3(0.8));
    model.setLightColor(light_source_color);
    model.setLightSourcePosition(light_source_position);
    model.render(time_stamp);

    // render to our targetTexture by binding the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // render cube with our 3x2 texture
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);

    // Clear the attachment(s).
    gl.clearColor(0, 1, 0, 1);   // clear to blue
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

    // gl.clearColor(0.8, 0.8, 0.8, 1.0);
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // gl.clearDepth(1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // light_source_position = glm.vec3(Math.sin(angle) * 50, 2.0, Math.cos(angle) * 50);

    model.setViewMatrix(glm.mat4(1.0));
    model.setVeiwPosition(camera.getPosition());
    // plane_model.setScale(glm.vec3(10.0));
    model.setPosition(glm.vec3(0.0, 0.0, -10.0));
    model.setRotation(angle, glm.vec3(0.0, 0.0, 0.0));
    // plane_model.setColor(glm.vec3(0.8));
    model.setLightColor(light_source_color);
    model.setLightSourcePosition(light_source_position);
    model.render(time_stamp);

    model.setPosition(glm.vec3(0.0, 1.8, -10.0));
    model.setRotation(angle, glm.vec3(0.3, 0.8, 0.0));
    model.render(time_stamp);

    model.setPosition(glm.vec3(0.0, -1.8, -10.0));
    model.setRotation(-angle, glm.vec3(0.3, 0.8, 0.0));
    model.render(time_stamp);

    // render to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // render the cube with the texture we just rendered to
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, c.width, c.height);


    model.setViewMatrix(camera.getViewMatrix());
    model.setPosition(glm.vec3(0.0, 1.8, 0.0));
    model.setRotation(angle, glm.vec3(0.3, 0.8, 0.0));
    model.render(time_stamp);

    // render to our targetTexture by binding the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // render cube with our 3x2 texture
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);

    // Clear the attachment(s).
    gl.clearColor(1, 0, 0, 1);   // clear to blue
    gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

    // gl.clearColor(0.8, 0.8, 0.8, 1.0);
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // gl.clearDepth(1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // light_source_position = glm.vec3(Math.sin(angle) * 50, 2.0, Math.cos(angle) * 50);

    model.setViewMatrix(glm.mat4(1.0));
    model.setVeiwPosition(camera.getPosition());
    // plane_model.setScale(glm.vec3(10.0));
    model.setPosition(glm.vec3(0.0, 0.0, -10.0));
    model.setRotation(angle, glm.vec3(0.0, 0.0, 0.0));
    // plane_model.setColor(glm.vec3(0.8));
    model.setLightColor(light_source_color);
    model.setLightSourcePosition(light_source_position);
    model.render(time_stamp);

    model.setPosition(glm.vec3(0.0, 1.8, -10.0));
    model.setRotation(angle, glm.vec3(0.3, 0.8, 0.0));
    model.render(time_stamp);

    model.setPosition(glm.vec3(0.0, -1.8, -10.0));
    model.setRotation(-angle, glm.vec3(0.3, 0.8, 0.0));
    model.render(time_stamp);

    // render to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // render the cube with the texture we just rendered to
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, c.width, c.height);

    model.setViewMatrix(camera.getViewMatrix());
    model.setPosition(glm.vec3(0.0, -1.8, 0.0));
    model.setRotation(-angle, glm.vec3(0.3, 0.8, 0.0));
    model.render(time_stamp);

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
      camera.processMouseInput(e);
    } // end of updatePosition

  // set up listener for window keyboard input while mouse over canvas
  function processInput(key_event) {
    camera.processKeyboardInput(key_event, delta_time);
  } // end of processInput


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
