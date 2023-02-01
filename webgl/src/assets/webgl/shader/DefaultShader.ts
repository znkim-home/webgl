const attributes = ["aVertexPosition", "aVertexColor", "aVertexSelectionColor", "aVertexNormal", "aTextureCoordinate"];
const uniforms = ["uModelViewMatrix", "uProjectionMatrix", "uOrthographicMatrix", "uObjectMatrix", "uRotationMatrix", "uNormalMatrix", "uPointSize", "uNearFar", "uPositionType", "uTexture", "uTextureType"];
const vertexShaderSource = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;
  attribute vec4 aVertexSelectionColor;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoordinate;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uOrthographicMatrix;
  uniform mat4 uObjectMatrix;
  uniform mat4 uRotationMatrix;
  uniform mat4 uNormalMatrix;
  uniform float uPointSize;
  uniform vec2 uNearFar;
  uniform int uPositionType; // 1: plane, 2: depth, basic

  varying vec4 vColor;
  varying vec4 vSelectionColor;
  varying vec3 vTransformedNormal;
  varying vec2 vTextureCoordinate;
  varying float vDepth;

  vec4 getOrthoPosition() {
    vec4 transformedPosition = uObjectMatrix * vec4(aVertexPosition, 1.0);
    vec4 orthoPosition = uModelViewMatrix * vec4(transformedPosition.xyz, 1.0);
    return orthoPosition;
  }
  vec3 getRotatedNormal() {
    vec3 rotatedModelNormal = (uRotationMatrix * vec4(aVertexNormal, 1.0)).xyz;
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
    gl_Position = uProjectionMatrix * orthoPosition;
    
    vTextureCoordinate = aTextureCoordinate;
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
  uniform int uTextureType; // default : color, 1 : texture, 2 : reverseY, 3 : depth
  
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
      //gl_FragColor = vec4(vColor.xyz, vColor.a);
      gl_FragColor = texture2D(uTexture, vec2(vTextureCoordinate.x, 1.0 - vTextureCoordinate.y));
    } else if (uTextureType == 2) {
      gl_FragColor = vec4(vSelectionColor.xyz, vSelectionColor.a);
    } else if (uTextureType == 3) {
      gl_FragColor = packDepth(vDepth);
    } else if (uTextureType == 4) {
      gl_FragColor = vec4(encodeNormal(vTransformedNormal), 1.0);
    } else if (uTextureType == 5) {
      gl_FragColor = vec4(vColor.xyz, vColor.a);
    }  else {
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