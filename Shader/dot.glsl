// vertex shader

uniform mat4 model;
uniform mat4 projection;
uniform mediump float point_size;


void main(void) {
  gl_Position = projection * model * vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = point_size;
}

// fragment shader

void main(void) {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
}
