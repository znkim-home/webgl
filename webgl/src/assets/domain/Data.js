const vertexShaderSource = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uObjectMatrix;

  varying lowp vec4 vColor;
  void main(void) {
    vec4 transformedPos = uObjectMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(transformedPos.xyz, 1.0);
    //vColor = vec4(0.5, 0.25, 1.0, 1.0);
    vColor = aVertexColor;
  }
`;

const fragmentShaderSource = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
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