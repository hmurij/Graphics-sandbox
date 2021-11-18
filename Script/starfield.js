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

// set up webGL
// gl.enable(gl.VERTEX_PROGRAM_POINT_SIZE);
// gl.enable(0x8642);


console.log("webGL version: " + gl.getParameter(gl.VERSION) +
     "\nShading language version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION) +
     "\nRenderer: " + gl.getParameter(gl.RENDERER) +
     "\nVendor: " + gl.getParameter(gl.VENDOR));
     // "\nALIASED_POINT_SIZE_RANGE: " + gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE));

// gl.viewport(0, 0, c.width, c.height);



main();

async function main(){
  const star_field = new StarField();
  await star_field.init();

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

    star_field.update();
    star_field.render(time_stamp);

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
    star_field.setProjectionMatrix(glm.ortho(-c.width / 2, c.width / 2, -c.height / 2, c.height / 2));
  } // end of function resizeCanvas()

} // end of main

function StarField(){
  // private class varialbles
  const dot = new ShaderProgram("Shader/dot.glsl");
  const line = new ShaderProgram("Shader/line.glsl");

  var projection_matrix;
  var model_matrix;
  var model1;
  var model2;

  var stars = [];
  var number_of_stars = sliderStars.valueAsNumber;

  var self = this;

  // private class members
  function generateRandomValue(){
    var value;

    do{
      value = Math.floor(Math.random() * (c.width + 1)) - c.width / 2;
      // if(value == 0)
      //   console.log(value);
    }while(value == 0);

    return  value;
  } // end of generateRandomValue

  function generateStar(){
    // return {x:generateRandomValue(), y:generateRandomValue(), z:generateRandomValue() + c.width / 2};
    // var z = Math.abs(generateRandomValue())
    var z = Math.abs(generateRandomValue() + c.width)
    return {x:generateRandomValue(), y:generateRandomValue(), z:z, previous_z:z};
  } // end of generateStar

  // public class members
  self.setProjectionMatrix = function(projection_matrix){
    line.use();
    line.setMat4("projection", projection_matrix);
    dot.use();
    dot.setMat4("projection", projection_matrix);
  } // end of setProjectionMatrix

  self.update = function(){
    for(let star of stars){
      star.previous_z = star.z;
      star.z -= 5 * sliderSpeed.valueAsNumber;

      if(star.z < 0){
        // star.z = generateRandomValue() + c.width;
        // star.previous_z = star.z;
        var temp_star = generateStar();
        star.x = temp_star.x;
        star.y = temp_star.y;
        star.z = temp_star.z;
        star.previous_z = temp_star.previous_z;

      } // end of if
    } // end of for

  } // end of update

  self.render = function(time_stamp){

    var point_size = 4.0;
    var x, y, x1, y1;

    for (let star of stars) {
      x = glm.mix(0.0, c.width / 2, glm.clamp(Math.abs(star.x) / star.z, 0, 1.0));
      if(star.x < 0) { x *= -1; }
      y = glm.mix(0.0, c.width / 2, glm.clamp(Math.abs(star.y) / star.z, 0, 1.0));
      if(star.y < 0) { y *= -1; }
      // console.log("sx: "  + sx + " sy: " + sy);

      if(x == c.width / 2 || x == -c.width / 2 || y == c.width / 2 || y == -c.width / 2){

        // console.log("stars.length - " + stars.length);
        if (stars.length < sliderStars.valueAsNumber){
          // push new stars
          stars.push(generateStar());
        } else if (stars.length > sliderStars.valueAsNumber){
          // pop old star
          stars.pop();
        } else {
          // reset star position
          // star = generateStar();
          var temp_star = generateStar();
          star.x = temp_star.x;
          star.y = temp_star.y;
          star.z = temp_star.z;
          star.previous_z = temp_star.previous_z;

        } // end of if else

      } else {
        // render star
        model_matrix = glm.mat4(1.0);
        model_matrix = glm.translate(model_matrix, glm.vec3(x, y, 0.0));
        point_size = glm.mix(0.0, sliderSize.valueAsNumber, (c.width - star.z) / c.width);
        dot.use();
        dot.setMat4("model", model_matrix);
        dot.setFloat("point_size", point_size);
        gl.drawArrays(gl.POINTS, 0, 1);

        // render star trace
        model1 = glm.mat4(1.0);
        x1 = glm.mix(0.0, c.width / 2, glm.clamp(Math.abs(star.x) / star.previous_z, 0, 1.0));
        if(star.x < 0) { x1 *= -1; }
        y1 = glm.mix(0.0, c.width / 2, glm.clamp(Math.abs(star.y) / star.previous_z, 0, 1.0));
        if(star.y < 0) { y1 *= -1; }
        model1 = glm.translate(model1, glm.vec3(x1, y1, 0.0));
        line.use();
        line.setMat4("model1", model1);
        line.setMat4("model2", model_matrix);
        gl.drawArrays(gl.LINES, 0, 2);
      }

    } // end of for
  } // end of render

  self.init = async function(){
    var x;
    for (x = 0; x < number_of_stars; x++){
      // console.log(generateRandomValue());
      stars.push(generateStar());
    }

    projection_matrix = glm.ortho(-c.width / 2, c.width / 2, -c.height / 2, c.height / 2);

    await dot.init();
    dot.use();
    dot.setMat4("projection", projection_matrix);

    await line.init();
    line.use()
    line.setMat4("projection", projection_matrix);

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
          gl.getAttribLocation(line.getProgram(), 'vertex_ID'),
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(gl.getAttribLocation(line.getProgram(), 'vertex_ID'));
    }

  } // end of init


} // end of function ArchimedeanSpiral
