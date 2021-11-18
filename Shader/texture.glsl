// vertex shader
attribute vec3 a_position;
attribute vec2 a_tex_coord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec2 v_tex_coord;

void main(void){
    gl_Position = projection * view * model * vec4(a_position, 1.0);
    v_tex_coord = a_tex_coord;
}

// fragment shader

precision mediump float;

// Passed in from the vertex shader.
varying vec2 v_tex_coord;

// The texture.
uniform sampler2D u_texture;

void main(void){
  // gl_FragColor = vec4(1.0);
  gl_FragColor = texture2D(u_texture, v_tex_coord);
}
