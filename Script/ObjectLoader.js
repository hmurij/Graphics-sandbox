"use strict";

function ObjectLoader(file_path){
  // Private class variables
  var self = this;
  var object_file_data;
  var geometric_vertices = [];
  var texture_vertices = [];
  var vertex_normals = [];
  var face_indices = [];

  // Public class variables

  // Private class methods
  async function readFile(){
    // console.log("reading file: " + file_path);
    let object_file = await fetch(file_path);
    object_file_data = await object_file.text();

    // console.log(object_data);
  } // end of readFile

  function parseObject(){
    // console.log(object_file_data);
    // const keywordRE = /(\w*)(?: )*(.*)/;
    // const keywordRE = /-?\d+.\d*/;

    // -?\d+.\d* - floating point signed numbers
    // \d+/\d+/\d+ - face data

    // split a string into an array of substrings
    const lines = object_file_data.split('\n');
    // console.log(lines);

    for(let line of lines){
      // Removes whitespace from both ends of a string optional?
      // let line = lines[line_index].trim();

      // if(line === '' || line.startsWith("#")){
      //   continue;
      // } // end of if

      // const m = keywordRE.exec(line);

      if (line.startsWith("vt")){
        // texture vertices
        // console.log("texture vertices: " + line);
        const parts = line.split(/\s+/).slice(1);
        // console.log("parts: " + parts);
        texture_vertices.push([parseFloat(parts[0]), parseFloat(parts[1])]);
      } else if (line.startsWith("vn")){
        // vertex normals
        // console.log("vertex normals: " + line);
        const parts = line.split(/\s+/).slice(1);
        // console.log("parts: " + parts);
        vertex_normals.push([parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])]);
      } else if(line.startsWith("v")){
        // geometric vertices
        // console.log("geometric vertices: " + line);
        const parts = line.split(/\s+/).slice(1);
        // console.log("parts: " + parts);
        geometric_vertices.push([parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])]);
      } else if (line.startsWith("f")){
        // face indices
        // console.log("face indices: " + line);
        const parts = line.split(/\s+/).slice(1);
        // console.log("parts: " + parts);
        var face = [];
        for(let part of parts){
          // console.log(part);
          var vertex = [];
          const indices = part.split("/");
          // console.log(indices);
          for(let indice of indices){
            vertex.push(parseInt(indice));
          } // end of for

          face.push(vertex);
        } // end of for

        face_indices.push(face);
      } // end of if else
    } // end of for

    // console.log(geometric_vertices);
    // console.log(texture_vertices);
    // console.log(vertex_normals);
    // console.log(face_indices);

  } // end of parseObject

  // Public class methods
  self.init = async function(){
    await readFile();
    parseObject();

  } // end of init()

  self.getVertexCount = function(){
    return face_indices.length;
  } // end of getVertexCount()

  self.getVetexData = function(){
    var vertex_data = [];
    for(var face = 0; face < face_indices.length; face++){
      for(let vertex of face_indices[face]){

        // push geometric coordinates into vertex_data
        for(let vertex_coordinates of geometric_vertices[(vertex[0] - 1)]){
          vertex_data.push(vertex_coordinates);
        } // end of for

        // push texture coordinates into vertex_data
        for(let texture_vertice of texture_vertices[(vertex[1] - 1)]){
          vertex_data.push(texture_vertice);
        } // end of for

        // push vertex normals into vertex_data
        for(let vertex_normal of vertex_normals[(vertex[2] - 1)]){
          vertex_data.push(vertex_normal);
        } // end of for
      } // end of for
    } // end of for

    // console.log(vertex_data);
    return vertex_data;
  } // end of getVertexData()

} // end of ObjectLoader
