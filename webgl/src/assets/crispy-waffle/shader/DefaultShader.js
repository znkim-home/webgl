const attributes = ["aVertexPosition", "aVertexColor", "aVertexSelectionColor", "aVertexNormal", "aTextureCoordinate"];
const uniforms = [
    "uProjectionMatrix",
    "uModelRotationMatrix", "uModelPositionHigh", "uModelPositionLow",
    "uObjectRotationMatrix", "uObjectPositionHigh", "uObjectPositionLow",
    "uNormalMatrix", "uPointSize", "uNearFar",
    "uTexture", "uTextureType"
];
const vertexShaderSource = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;
  attribute vec4 aVertexSelectionColor;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoordinate;
  
  uniform mat4 uProjectionMatrix;

  uniform mat4 uModelRotationMatrix;
  uniform vec3 uModelPositionHigh;
  uniform vec3 uModelPositionLow;

  uniform mat4 uObjectRotationMatrix;
  uniform vec3 uObjectPositionHigh;
  uniform vec3 uObjectPositionLow;

  uniform mat4 uNormalMatrix;
  uniform float uPointSize;
  uniform vec2 uNearFar;

  varying vec4 vColor;
  varying vec4 vSelectionColor;
  varying vec3 vTransformedNormal;
  varying vec2 vTextureCoordinate;
  varying float vDepth;

  vec4 getPosition() {
    vec4 transformedPosition = uObjectRotationMatrix * vec4(aVertexPosition, 1.0);
		vec3 highDifference = uObjectPositionHigh.xyz - uModelPositionHigh.xyz;
		vec3 lowDifference = (uObjectPositionLow.xyz + transformedPosition.xyz) - uModelPositionLow.xyz;
		vec4 pos4 = vec4(highDifference.xyz + lowDifference.xyz, 1.0);
    return pos4;
  }

  vec4 getOrthoPosition() {
    vec4 transformedPosition = getPosition();
    vec4 orthoPosition = uModelRotationMatrix * transformedPosition;
    return orthoPosition;
  }

  vec3 getRotatedNormal() {
    vec3 rotatedModelNormal = (uObjectRotationMatrix * vec4(aVertexNormal, 1.0)).xyz;
    vec3 rotatedNormal = normalize(uNormalMatrix * vec4(rotatedModelNormal, 1.0)).xyz;
    return rotatedNormal;
  }

  float calcDepth(float zValue) {
    return -(zValue / uNearFar.y);
  }

  void main(void) {
    vec4 orthoPosition = getOrthoPosition();
    
    vColor = aVertexColor;
    vSelectionColor = aVertexSelectionColor;
    vTransformedNormal = getRotatedNormal();
    vTextureCoordinate = aTextureCoordinate;
    vDepth = calcDepth(orthoPosition.z);
    
    gl_PointSize = uPointSize;
    gl_Position = uProjectionMatrix * orthoPosition;
  }
`;
const fragmentShaderSource = `
  precision highp float;

  varying vec4 vColor;
  varying vec4 vSelectionColor;
  varying vec2 vTextureCoordinate;
  varying vec3 vTransformedNormal;
  varying float vDepth;

  uniform sampler2D uTexture;
  uniform int uTextureType;
  
  vec3 encodeNormal(in vec3 normal) {
    return normal.xyz * 0.5 + 0.5;
  }
  vec3 decodeNormal(in vec3 normal){
    return normal * 2.0 - 1.0;
  }
  vec4 packDepth(float depth) {
    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * depth;
    enc = fract(enc);
    enc -= enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);
    return enc;
  }
  void main(void) {
    if (uTextureType == 1) {
      vec2 textureCoordinateReverseY = vec2(vTextureCoordinate.x, 1.0 - vTextureCoordinate.y);
      gl_FragColor = texture2D(uTexture, textureCoordinateReverseY);
    } else if (uTextureType == 2) {
      gl_FragColor = vec4(vSelectionColor.xyz, vSelectionColor.a);
    } else if (uTextureType == 3) {
      gl_FragColor = packDepth(vDepth);
    } else if (uTextureType == 4) {
      gl_FragColor = vec4(encodeNormal(vTransformedNormal), 1.0);
    } else {
      gl_FragColor = vec4(vColor.xyz, vColor.a);
    }
  }
`;
export const DefaultShader = {
    attributes: attributes,
    uniforms: uniforms,
    vertexShaderSource: vertexShaderSource,
    fragmentShaderSource: fragmentShaderSource,
};
