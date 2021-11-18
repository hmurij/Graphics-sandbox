// vertex shader
attribute float vertex_ID;

uniform mat4 model1;
uniform mat4 model2;
uniform mat4 projection;

void main(void){

  if(vertex_ID == 0.0)
    gl_Position = projection * model1 * vec4(0.0, 0.0, 0.0, 1.0);
  else
    gl_Position = projection * model2 * vec4(0.0, 0.0, 0.0, 1.0);
}

// fragment shader

void main(void){
  gl_FragColor = vec4(1.0, 1.0, 1.0, 0.0);
}
