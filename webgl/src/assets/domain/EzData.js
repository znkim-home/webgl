export const faceColors = [
  [1.0,  1.0,  1.0,  1.0], // Front face: white
  [1.0,  0.0,  0.0,  1.0], // Back face: red
  [0.0,  1.0,  0.0,  1.0], // Top face: green
  [0.0,  0.0,  1.0,  1.0], // Bottom face: blue
  [1.0,  1.0,  0.0,  1.0], // Right face: yellow
  [1.0,  0.0,  1.0,  1.0], // Left face: purple
];

export const positions = [
  // Front face
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

export const indices = [
  0,  1,  2,  // front triangle 1
  0,  2,  3,  // front triangle 2
  4,  5,  6,  // back
  4,  6,  7,  // back
  8,  9,  10, // top
  8,  10, 11, // top
  12, 13, 14, // bottom
  12, 14, 15, // bottom
  16, 17, 18, // right
  16, 18, 19, // right
  20, 21, 22, // left
  20, 22, 23, // left
];

export const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;
  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
`;

export const fragmentShaderSource = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;