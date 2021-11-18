"use strict";

// console.log('loaded glm-js version: ', glm.version);
// console.log('vec3 example: ', glm.vec3(1, 2, 3));

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

window.requestAnimationFrame = window.requestAnimationFrame
     || window.mozRequestAnimationFrame
     || window.webkitRequestAnimationFrame
     || window.msRequestAnimationFrame
     || function (f) { return setTimeout(f, 1000 / 60); }; // simulate calling code 60


const gl = c.getContext("webgl");

// If we don't have a GL context, give up now

if (!gl) {
  alert('Unable to initialize WebGL. Your browser or machine may not support it.');
  // return;
}

console.log("webGL version: " + gl.getParameter(gl.VERSION) +
     "\nShading language version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION) +
     "\nRenderer: " + gl.getParameter(gl.RENDERER) +
     "\nVendor: " + gl.getParameter(gl.VENDOR));
// gl.viewport(0, 0, c.width, c.height);



main();

async function main(){
  const sine_wave = new SinWave();
  await sine_wave.init();

  requestAnimationFrame(animationLoop);

  var current_time = 0;
  var delta_time = 0;
  var counter = 0;
  var fps = document.getElementById("fps");

  function animationLoop(time_stamp) {

    delta_time = time_stamp - current_time;
    current_time = time_stamp;

    counter++;
    if(counter == 5){
      fps.innerHTML = "FPS: " + (1000 / delta_time).toFixed(2);

      counter = 0;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    sine_wave.render(time_stamp);

    requestAnimationFrame(animationLoop);
  }


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
    sine_wave.setProjectionMatrix(glm.ortho(-c.width / 2, c.width / 2, -c.height / 2, c.height / 2));
  } // end of function resizeCanvas()

} // end of main

function SinWave(){
  // private class varialbles
  const line_program = new ShaderProgram("Shader/line.glsl");
  var angle;
  var projection_matrix;
  var model_matrix;
  var model1;
  var model2;
  var self = this;

  // private class members

  // public class members
  self.setProjectionMatrix = function(projection_matrix){
    line_program.setMat4("projection", projection_matrix);
  } // end of setProjectionMatrix

  self.render = function(time_stamp){
    // Archimedean spiral
    var x;
    // var number_of_points = 10;
    var number_of_points = sliderPoints.valueAsNumber;
    var delta_x = (2 * c.width * 0.47) / number_of_points;
    var angle = 2 * Math.PI - (time_stamp / 3000) % (2 * Math.PI);
    var angle_offset = 0;
    // var delta_angle = (2 * Math.PI) / 20;
    var delta_angle = sliderAngle.valueAsNumber;
    // console.log("sliderAngle.value - " + sliderAngle.value);

    for (x = -(c.width * 0.47); x <= (c.width * 0.47); x += delta_x) {
      // console.log("x = " + x);
      model_matrix = glm.mat4(1.0);
      model_matrix = glm.translate(model_matrix, glm.vec3(x, (c.height * 0.47) * Math.sin(angle + angle_offset), 0));
      angle_offset += delta_angle;

      // model_location = gl.getUniformLocation(shader_program.getProgram(), "model");
      // gl.uniformMatrix4fv(model_location, false, model_matrix.array);
      // shader_program.use();
      // shader_program.setMat4("model", model_matrix);
      // gl.drawArrays(gl.POINTS, 0, 1);

      // first iteration
      if(x == -(c.width * 0.47)){
        model1 = model_matrix;
        model2 = model_matrix;

      } else {
        model2 = model_matrix;
        line_program.use();
        line_program.setMat4("model1", model1);
        line_program.setMat4("model2", model2);
        gl.drawArrays(gl.LINES, 0, 2);
        model1 = model2;

      } // end of if else
    } // end of for
  } // end of render

  self.init = async function(){
    projection_matrix = glm.ortho(-c.width / 2, c.width / 2, -c.height / 2, c.height / 2);
    // shader_program.setMat4("projection", projection_matrix);

    // var line_program = new ShaderProgram("Shader/line.glsl");
    await line_program.init();
    line_program.use()
    line_program.setMat4("projection", projection_matrix);

    // create buffer for vertex indexID
    const vertex_indexID_buffer = gl.createBuffer();

    // bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_indexID_buffer);

    // create vertex id index array
    const index_ID = [0, 1];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(index_ID), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, new Int8Array(index_ID), gl.STATIC_DRAW);

    // Tell WebGL how to pull out the vertex id index from the vertex index
    // buffer into the vertex_ID attribute.
    {
      const numComponents = 1;  // pull out 1 values per iteration
      const type = gl.BYTE;    // the data in the buffer is 32bit floats
      const normalize = false;  // don't normalize
      const stride = 0;         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
      const offset = 0;         // how many bytes inside the buffer to start from
      // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
          gl.getAttribLocation(line_program.getProgram(), 'vertex_ID'),
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(gl.getAttribLocation(line_program.getProgram(), 'vertex_ID'));
    }

  } // end of init


} // end of function ArchimedeanSpiral
