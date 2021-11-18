/*jslint node: true */
/*global gl: false */
/*global async: false*/

"use strict";

function ShaderProgram(file_path) {
  // Private class variables
  var program_Id;
  var vertex_shader_code;
  var fragment_shader_code;
  var vertex_shader;
  var fragment_shader;
  var uniform_location = [];
  var self = this;
  var constructor = async function(){


  };

  // Private functions
  async function readShaderCodeFromFile() {
    // console.log(file_path);

    let shader_code_object = await fetch(file_path);
    let shader_code = await shader_code_object.text();

    // console.log(shader_code);

    let fragment_shader_start = shader_code.search("// fragment shader");
    // console.log("fragment shader starts at: " + fragment_shader_start);

    vertex_shader_code = shader_code.slice(0, fragment_shader_start);
    // console.log(vertex_shader_code);

    fragment_shader_code = shader_code.slice(fragment_shader_start, shader_code.length);
    // console.log(fragment_shader_code);
  };


  function compileShader(shader_code, shader_type) {
    console.log(shader_code);
    // Create shader object
    var shader = gl.createShader(shader_type);
    //Attach shader source code
    gl.shaderSource(shader, shader_code);
    //Compile the vertex shader
    gl.compileShader(shader);
    checkCompileErrors(shader, shader_type);

    return shader;
  };

  function checkCompileErrors(shader, shader_type){
    // console.log(shader_type);

    // Check if it compiled
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      // Something went wrong during compilation; get the error
      console.log((gl.getShaderParameter(shader, gl.SHADER_TYPE) === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") +
      " SHADER COMPILATION ERROR:\n" + gl.getShaderInfoLog(shader));

    } else {
      console.log((gl.getShaderParameter(shader, gl.SHADER_TYPE) === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") +
      " SHADER COMPILE STATUS: NO ERRORS");
    }
  };

  function getUniformLocation(name) {
    // console.log("uniform_location.length: " + uniform_location.length);
    // uniform_location.push({uniform_name:name, location:new_location});
    // console.log("uniform_location[0]: " + uniform_location[0].uniform_name + " : " + uniform_location[0].location);

    var i;
    for(i = 0; i < uniform_location.length; i++){
      if(uniform_location[i].uniform_name == name){
        return uniform_location[i].location;
        // console.log("uniform_location[i].location: " + uniform_location[i].location);
      }
    }

    let new_location = gl.getUniformLocation(program_Id, name);
    uniform_location.push({uniform_name:name, location:new_location});

    return new_location;

  };

  // Public functions
  self.setFloat = function (name, value){
    gl.uniform1f(getUniformLocation(name), value);
  }; // end of setFloat

  self.setVec3 = function (name, value){
    if(Array.isArray(value)){
      gl.uniform3fv(getUniformLocation(name), value);
    } else {
      gl.uniform3fv(getUniformLocation(name), value.array);
    } // end of if else
  }; // end of setVec3

  // void setVec3(const std::string &name, const glm::vec3 &value) const
	// {
	// 	glUniform3fv(glGetUniformLocation(program_ID, name.c_str()), 1, &value[0]);
	// }
	// void setVec3(const std::string &name, float x, float y, float z) const
	// {
	// 	glUniform3f(glGetUniformLocation(program_ID, name.c_str()), x, y, z);
	// }

  self.setMat4 = function (name, matrix) {
    if(Array.isArray(matrix)){
      gl.uniformMatrix4fv(getUniformLocation(name), false, matrix);
    } else {
      gl.uniformMatrix4fv(getUniformLocation(name), false, matrix.array);
    } // end of if
  }; // end of setMat4



  self.use = function() { gl.useProgram(program_Id); };
  self.getProgram = function() { return program_Id; };

  self.init = async function() {
    program_Id = gl.createProgram();
    await readShaderCodeFromFile().then(function(){
      vertex_shader = compileShader(vertex_shader_code, gl.VERTEX_SHADER);
      fragment_shader = compileShader(fragment_shader_code, gl.FRAGMENT_SHADER);
      gl.attachShader(program_Id, vertex_shader);
      gl.attachShader(program_Id, fragment_shader);
      gl.deleteShader(vertex_shader);
      gl.deleteShader(fragment_shader);

      gl.linkProgram(program_Id);
      if(gl.getProgramParameter(program_Id, gl.LINK_STATUS)){
        console.log("SHADER PROGRAM LINK STATUS: NO ERRORS");
      } else {
        console.log("SHADER PROGRAM LINK ERROR:\n" + gl.getProgramInfoLog(shader));
      }
    });
  };
} // end of class ShaderProgram
