const vertexShaderSource = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;
  attribute vec3 aVertexNormal;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uObjectMatrix;
  uniform mat4 uNormalMatrix;
  
  varying lowp vec4 vColor;
  varying lowp vec3 vLighting;
  void main(void) {
    vColor = aVertexColor;

    vec3 ambientLight = vec3(0.6, 0.6, 0.6);
    vec3 directionalLightColor = vec3(1, 1, 1);
    vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    vec4 transformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 1.0));
    vec4 transformedPos = uObjectMatrix * vec4(aVertexPosition, 1.0);

    float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
    //vLighting = aVertexNormal;

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(transformedPos.xyz, 1.0);
  }
`;

const fragmentShaderSource = `
  varying lowp vec4 vColor;
  varying lowp vec3 vLighting;

  void main(void) {
    gl_FragColor = vec4(vColor.xyz * vLighting, vColor.a);
    //gl_FragColor = vColor;
  }
`;

const colors = [
  [1.0,  1.0,  1.0,  1.0], 
  [1.0,  0.0,  0.0,  1.0],
  [0.0,  1.0,  0.0,  1.0],
  [0.0,  0.0,  1.0,  1.0],
  [1.0,  1.0,  0.0,  1.0],
  [1.0,  0.0,  1.0,  1.0],
];

const positions = [
  -1.0, -1.0,  1.0,
  1.0, -1.0,  1.0,
  1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,
  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
  1.0,  1.0, -1.0,
  1.0, -1.0, -1.0,
  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
  1.0,  1.0,  1.0,
  1.0,  1.0, -1.0,
  // Bottom face
  -1.0, -1.0, -1.0,
  1.0, -1.0, -1.0,
  1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,
  // Right face
  1.0, -1.0, -1.0,
  1.0,  1.0, -1.0,
  1.0,  1.0,  1.0,
  1.0, -1.0,  1.0,
  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0,
];

const indices = [
  0,  1,  2,
  0,  2,  3,
  4,  5,  6,
  4,  6,  7,
  8,  9,  10,
  8,  10, 11,
  12, 13, 14,
  12, 14, 15,
  16, 17, 18,
  16, 18, 19,
  20, 21, 22,
  20, 22, 23,
];

export const Data = {
  vertexShaderSource : vertexShaderSource,
  fragmentShaderSource : fragmentShaderSource,
  colors : colors,
  positions : positions,
  indices : indices,
};