"use strict";

function Model(file_path, shader) {
  // private class variables
  const object = new ObjectLoader(file_path);
  const model_program = new ShaderProgram(shader);
  var coordinates_attrib_location;
  var normals_attrib_location;
  var tex_coordinates_attrib_location;

  var projection_matrix;
  var model_matrix;
  var view_matrix;
  var model_position = glm.vec3(0.0, 0.0, 0.0);
  // var model_position = [0.0, 0.0, 0.0]
  var rotation_angle = 0;
  var model_rotation_axis = glm.vec3(0.0, 0.0, 0.0);
  // var model_rotation_axis = [0.0, 0.0, 0.0];
  // var light_source = [60.0, 20.0, 30.0];
  var light_source_position = glm.vec3(60.0, 20.0, 30.0);
  var light_color = glm.vec3(0.8);
  var view_position = glm.vec3(0.0, 0.0, -10.0);
  var object_color = glm.vec3(0.8);
  var object_scale = glm.vec3(1.0);

  var vertex_buffer;
  var vertex_positions;

  var self = this;

  // public clas variables

  // private class methods
  function setVertexAttribPointer() {
    // bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    {
      const numComponents = 3;  // pull out 1 values per iteration
      const type = gl.FLOAT;    // the data in the buffer is 32bit floats
      const normalize = false;  // don't normalize
      const stride = 8 * 4;         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
      const offset = 0;         // how many bytes inside the buffer to start from

      gl.vertexAttribPointer(
          coordinates_attrib_location,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(coordinates_attrib_location);
    } // set up vertex position attribute

    if(tex_coordinates_attrib_location != -1){
      {
        const numComponents = 3;  // pull out 1 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 8 * 4;         // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 3 * 4;         // how many bytes inside the buffer to start from

        gl.vertexAttribPointer(
          tex_coordinates_attrib_location,
          numComponents,
          type,
          normalize,
          stride,
          offset);
          gl.enableVertexAttribArray(tex_coordinates_attrib_location);
        } // set up texture coordinates attribute
    } // end of if

    if(normals_attrib_location != -1){
      {
        const numComponents = 3;  // pull out 1 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 8 * 4;         // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 5 * 4;         // how many bytes inside the buffer to start from

        gl.vertexAttribPointer(
          normals_attrib_location,
          numComponents,
          type,
          normalize,
          stride,
          offset);
          gl.enableVertexAttribArray(normals_attrib_location);
        } // set up vector normal attribute
    } // end of if


  } // end of setVertexAttribPointer


  // public class methods
  self.init = async function() {
    // console.log("Model init");
    await object.init();
    await model_program.init();

    // projection_matrix = glm.GLMAT.mat4.create();
    // glm.GLMAT.mat4.perspective(projection_matrix, glm.radians(45.0), c.width / c.height, 0.1, 100.0);
    projection_matrix = glm.perspective(glm.radians(45.0), c.width / c.height, 0.1, 100.0);
    // console.log(projection_matrix);
    model_program.use();
    model_program.setMat4("projection", projection_matrix);
    coordinates_attrib_location = gl.getAttribLocation(model_program.getProgram(), 'a_position');
    normals_attrib_location = gl.getAttribLocation(model_program.getProgram(), 'a_normal');
    tex_coordinates_attrib_location = gl.getAttribLocation(model_program.getProgram(), 'a_tex_coord');

    // create buffer for vertex positions
    vertex_buffer = gl.createBuffer();

    // bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    // get positions of vertices
    vertex_positions = object.getVetexData();

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.getVetexData()), gl.STATIC_DRAW);


  } // end of init()

  self.render = function(time_stamp) {

    // var angle = 2 * Math.PI - (time_stamp / 2000) % (2 * Math.PI);
    // var angle = (time_stamp / 3000) % (2 * Math.PI);

    model_matrix = glm.mat4(1);
    model_matrix = glm.scale(model_matrix, object_scale);
    // model_matrix = glm.GLMAT.mat4.create();
    // console.log(model_matrix);
    model_matrix = glm.translate(model_matrix, model_position);
    // model_matrix = glm.GLMAT.mat4.translate(model_matrix, model_matrix, model_position);
    // model_matrix = glm.GLMAT.mat4.translate(model_matrix, model_matrix, glm.vec3(0.0, 0.0, Math.sin(angle) * 2 - 2).array);
    // model_matrix = glm.GLMAT.mat4.translate(model_matrix, model_matrix, [0.0, 0.0, Math.sin(angle) * 2 - 2]);
    // model_matrix = glm.rotate(model_matrix, angle, glm.normalize(glm.vec3(1.0, 0.0, 0.0)));
    model_matrix = glm.rotate(model_matrix, rotation_angle, glm.normalize(model_rotation_axis));
    // model_matrix = glm.GLMAT.mat4.rotate(model_matrix, model_matrix, rotation_angle, glm.GLMAT.vec3.normalize(model_rotation_axis, model_rotation_axis));
    model_program.use();
    model_program.setMat4("model", model_matrix);
    model_program.setMat4("view", view_matrix);

    // light_source_position = glm.vec3(Math.sin(angle) * 50, 0.0, Math.cos(angle) * 50);
    // light_source = [Math.sin(angle) * 50, 0.0, Math.cos(angle) * 50];
    // console.log("light_source - " + light_source);
    model_program.setVec3("u_light_pos", light_source_position);
    model_program.setVec3("u_view_pos", view_position);
    model_program.setVec3("u_object_color", object_color);
    model_program.setVec3("u_light_color", light_color);

    setVertexAttribPointer();

    const vertex_count = 3;
    gl.drawArrays(gl.TRIANGLES, 0, object.getVertexCount() * vertex_count);

    // render model in wireframe mode
    // for(var offset = 0; offset < object.getVertexCount() * 3; offset += 3){
    //   const vertex_count = 3;
    //   gl.drawArrays(gl.LINE_LOOP, offset, vertex_count);
    // } // end of for

  } // end of render

  self.setScale = function(scale){
    object_scale = scale;
  } // end of setScale

  self.setVeiwPosition = function(new_view_position){
    view_position = new_view_position;
  } // end of setVeiwPosition()

  self.setPosition = function(position) {
    model_position = position;
  } // end of setPosition()

  self.setColor = function(color){
    object_color = color;
  } // end of setColor()

  self.setLightColor = function(color){
    light_color = color;
  } // end of setLightColor()

  self.setLightSourcePosition = function(position){
    light_source_position = position;
  } // end of setLightSourcePosition()

  self.setRotation = function(angle, rotation_axis) {
    rotation_angle = angle;
    model_rotation_axis = rotation_axis;
  } // end of setRotation()

  self.setViewMatrix = function(new_view_matrix) {
    // console.log(view_matrix);
    view_matrix = new_view_matrix;

  } // end of setViewMatrix

} // end of class Model
