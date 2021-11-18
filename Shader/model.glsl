// vertex shader
attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying vec3 v_normal;
varying vec3 v_frag_pos;

void main(void){
    gl_Position = projection * view * model * vec4(a_position, 1.0);
    v_frag_pos = vec3(model * vec4(a_position, 1.0));
    v_normal = mat3(model) * a_normal;

}

// fragment shader

precision highp float;

// uniform float u_ambient_strength = 0.1;
uniform vec3 u_light_color;
uniform vec3 u_object_color;
// uniform float specular_strength = 0.5;
uniform vec3 u_light_pos;
uniform vec3 u_view_pos;

// varying highp vec3 v_normal;
varying vec3 v_normal;
varying vec3 v_frag_pos;

void main(void){
  float u_ambient_strength = 0.3;
  // vec3 u_light_color = vec3(0.8);
  // vec3 u_object_color = vec3(0.82, 0.68, 0.21);
  float specular_strength = 0.5;
  // vec3 u_light_pos = vec3(60.0, 20.0, 30.0);

  vec3 ambient = u_light_color * u_ambient_strength;

  vec3 normal = normalize(v_normal);
  vec3 light_dir = normalize(u_light_pos - v_frag_pos);
  float diff = max(dot(normal, light_dir), 0.0);
  vec3 diffuse = diff * u_light_color;

  vec3 view_dir = normalize(u_view_pos - v_frag_pos);
  // vec3 view_dir = normalize(vec3(0.0, 0.0, 10.0) - v_frag_pos);
  vec3 reflect_dir = reflect(-light_dir, normal);
  float spec = pow(max(dot(view_dir, reflect_dir), 0.0), 32.0);
  vec3 specular = specular_strength * spec * u_light_color;

  vec3 result = (ambient + diffuse + specular) * u_object_color;
  gl_FragColor = vec4(result, 1.0);
}
