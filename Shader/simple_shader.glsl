// vertex shader

uniform mat4 model;
uniform mat4 projection;

void main(void) {
  gl_Position = projection * model * vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 3.0;
}

// fragment shader

void main(void) {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
}
