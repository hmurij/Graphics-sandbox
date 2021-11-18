"use strict";

function Camera(position, up , front, pitch, yaw){
  // private class variables
  var self = this;

  // Default camera values
  // const YAW         = -90.0;
  // const PITCH       =  0.0;
  // const SPEED       =  1.0;
  // const SENSITIVITY =  0.025;
  // const ZOOM        =  45.0;

  // camera Attributes
  var position = position;
  var front = front;
  var up = up;
  var right;
  var world_up = up;
  // euler Angles
  var yaw = yaw;
  if(yaw == undefined){
    // console.log("yaw: " + yaw);
    yaw = -90.0;
  } // end of if
  var pitch = pitch;
  if(pitch == undefined){
    // console.log("pitch: " + pitch);
    pitch = 0.0;
  } // end of if
  // camera options
  var movement_speed = 1.0;
  var mouse_sensitivity = 0.025;
  var zoom = 45.0;
  updateCameraVectors();

  // public class vairables

  // private class methods
  // calculates the front vector from the Camera's (updated) Euler Angles
  function updateCameraVectors(){
    // calculate the new Front vector
    var new_front = glm.vec3();
    new_front.x = Math.cos(glm.radians(yaw)) * Math.cos(glm.radians(pitch));
    new_front.y = Math.sin(glm.radians(pitch));
    new_front.z = Math.sin(glm.radians(yaw)) * Math.cos(glm.radians(pitch));
    front = glm.normalize(new_front);
    // also re-calculate the Right and Up vector
    right = glm.normalize(glm.cross(front, world_up));  // normalize the vectors, because their length gets closer to 0 the more you look up or down which results in slower movement.
    up    = glm.normalize(glm.cross(right, front));
  } // end of updateCameraVectors

  // public class methods
  this.getPosition = function(){
    return position;
  } // end of getPosition()

  // returns the view matrix calculated using Euler Angles and the LookAt Matrix
  this.getViewMatrix = function(){
    return glm.lookAt(position, position['+'](front), up);
  } // end of getViewMatrix()

  // processes input received from a mouse input system.
  this.processMouseInput = function(e){

    // console.log(e.movementX + " : " + e.movementY);
    var x_offset = e.movementX * mouse_sensitivity;
    var y_offset = e.movementY * mouse_sensitivity;

    yaw += x_offset;
    pitch -= y_offset;

    // make sure that when pitch is out of bounds, screen doesn't get flipped
    if (pitch > 89.0)
      pitch = 89.0;
    if (pitch < -89.0)
      pitch = -89.0;

    // update Front, Right and Up Vectors using the updated Euler angles
    updateCameraVectors();
  } // end of processMouseInput()

  // processes input received from any keyboard input system.
  this.processKeyboardInput = function(key_event, delta_time){
    var camera_speed = movement_speed * (delta_time / 1000);

    // if W pressed keyCode = 119
    if(key_event.keyCode == 119){
      // console.log("pressing W");
      // glm.GLMAT.vec3.add(camera_pos, camera_pos, glm.GLMAT.vec3.mul([0, 0, 0], camera_front, [camera_speed, camera_speed, camera_speed]));
      position['+='](front['*'](camera_speed));
    } // end of if

    // if S pressed keyCode = 115
    if(key_event.keyCode == 115){
      // console.log("pressing S");
      // glm.GLMAT.vec3.sub(camera_pos, camera_pos, glm.GLMAT.vec3.mul([0, 0, 0], camera_front, [camera_speed, camera_speed, camera_speed]));
      position['-='](front['*'](camera_speed));
    } // end of if

    // if A pressed keyCode = 97
    if(key_event.keyCode == 97){
      // console.log("pressing A");
      position['-='](glm.normalize(glm.cross(front, up))['*'](camera_speed));
    } // end of if

    // if D pressed keyCode = 100
    if(key_event.keyCode == 100){
      // console.log("pressing D");
      position['+='](glm.normalize(glm.cross(front, up))['*'](camera_speed));
    } // end of if
  } // end of processKeyboardInput

} // end of class Camera
