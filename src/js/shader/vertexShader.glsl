
void main() {
  vec3 pos = position;
  vec4 modelPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * modelPosition;
  // gl_PointSize = 2.0;
  gl_PointSize = 3000.0 / -modelPosition.z;
}