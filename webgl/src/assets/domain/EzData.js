
export const cameraPosition = [0, 0, 0];

export const cameraAngle = {
  toggle : [0, 0, 0],
  angle : [0, 0, 0],
};

export const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;
  //attribute vec4 aVertexColor;

  uniform mat4 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  //varying lowp vec4 vColor;
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;
  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    //vColor = aVertexColor;
    vTextureCoord = aTextureCoord;

    highp vec3 ambientLight = vec3(0.1, 0.1, 0.1);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.5, 0.5, 0.5));
    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 1.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`;

export const fragmentShaderSource = `
  //varying lowp vec4 vColor;
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    //gl_FragColor = vColor;
    //gl_FragColor = texture2D(uSampler, vTextureCoord);
    
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  }
`;

export const faceColors = [
  [1.0,  1.0,  1.0,  1.0], // Front face: white
  [1.0,  0.0,  0.0,  1.0], // Back face: red
  [0.0,  1.0,  0.0,  1.0], // Top face: green
  [0.0,  0.0,  1.0,  1.0], // Bottom face: blue
  [1.0,  1.0,  0.0,  1.0], // Right face: yellow
  [1.0,  0.0,  1.0,  1.0], // Left face: purple
];

/*export const positions = [
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
];*/

export const positions = [
  // Front face
  -0.1, -0.1,  0.1,
  0.1, -0.1,  0.1,
  0.1,  0.1,  0.1,
  -0.1,  0.1,  0.1,
  // Back face
  -0.1, -0.1, -0.1,
  -0.1,  0.1, -0.1,
  0.1,  0.1, -0.1,
  0.1, -0.1, -0.1,
  // Top face
  -0.1,  0.1, -0.1,
  -0.1,  0.1,  0.1,
  0.1,  0.1,  0.1,
  0.1,  0.1, -0.1,
  // Bottom face
  -0.1, -0.1, -0.1,
  0.1, -0.1, -0.1,
  0.1, -0.1,  0.1,
  -0.1, -0.1,  0.1,
  // Right face
  0.1, -0.1, -0.1,
  0.1,  0.1, -0.1,
  0.1,  0.1,  0.1,
  0.1, -0.1,  0.1,
  // Left face
  -0.1, -0.1, -0.1,
  -0.1, -0.1,  0.1,
  -0.1,  0.1,  0.1,
  -0.1,  0.1, -0.1,
];

export const vertexNormals = [
  // Front
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,

  // Back
   0.0,  0.0, -1.0,
   0.0,  0.0, -1.0,
   0.0,  0.0, -1.0,
   0.0,  0.0, -1.0,

  // Top
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,

  // Bottom
   0.0, -1.0,  0.0,
   0.0, -1.0,  0.0,
   0.0, -1.0,  0.0,
   0.0, -1.0,  0.0,

  // Right
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,

  // Left
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0
];

export const textureCoordinates = [
  // Front
  0.0,  1.0,
  1.0,  1.0,
  1.0,  0.0,
  0.0,  0.0,
  // Back
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
  // Top
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
  // Bottom
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
  // Right
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
  // Left
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
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
