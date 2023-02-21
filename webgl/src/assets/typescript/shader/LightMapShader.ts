const attributes = ["aVertexPosition", "aVertexColor", "aVertexSelectionColor", "aVertexNormal", "aTextureCoordinate"];
const uniforms = [
  "uOrthographicMatrix", 
  "uModelRotationMatrix", "uModelPositionHigh", "uModelPositionLow", 
  "uObjectRotationMatrix", "uObjectPositionHigh", "uObjectPositionLow", 
  "uNormalMatrix", "uPointSize", "uNearFar", 
  "uTexture", "uTextureType"];

const vertexShaderSource = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;
  attribute vec4 aVertexSelectionColor;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoordinate;
  
  uniform mat4 uOrthographicMatrix;

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
  varying float vDepth;

  vec4 getPosition() {
    vec4 transformedPosition = uObjectRotationMatrix * vec4(aVertexPosition, 1.0);
		//vec3 highDifference = uObjectPositionHigh.xyz - uModelPositionHigh.xyz;
		//vec3 lowDifference = (uObjectPositionLow.xyz + transformedPosition.xyz) - uModelPositionLow.xyz;
		//vec4 pos4 = vec4(highDifference.xyz + lowDifference.xyz, 1.0);
    return transformedPosition;
  }
  vec4 getOrthoPosition() {
    vec4 transformedPosition = getPosition();
    vec4 orthoPosition = transformedPosition;
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
    vColor = aVertexColor;
    vSelectionColor = aVertexSelectionColor;
    gl_PointSize = uPointSize;

    vec4 orthoPosition = getOrthoPosition();
    vTransformedNormal = getRotatedNormal();

    vDepth = calcDepth(orthoPosition.z);
    gl_Position = uOrthographicMatrix * orthoPosition;
  }
`;

const fragmentShaderSource = `
  precision highp float;

  varying vec4 vColor;
  varying vec4 vSelectionColor;
  varying vec3 vTransformedNormal;
  varying float vDepth;

  uniform sampler2D uTexture;
  uniform int uTextureType;

  vec4 packDepth(float depth) {
    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * vDepth;
    enc = fract(enc);
    enc -= enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);
    return enc;
  }
  
  void main(void) {
    gl_FragColor = packDepth(vDepth);
    //gl_FragColor = vec4(vColor.xyz, vColor.a);
  }
`;

export const LightMapShader = {
  attributes: attributes,
  uniforms: uniforms,
  vertexShaderSource: vertexShaderSource,
  fragmentShaderSource: fragmentShaderSource,
};