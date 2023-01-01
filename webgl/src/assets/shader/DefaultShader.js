const attributes = ["aVertexPosition", "aVertexColor", "aVertexNormal", "aTextureCoordinate"];
const uniforms = ["uModelViewMatrix", "uProjectionMatrix", "uObjectMatrix", "uNormalMatrix", "uPointSize", "uPositionType", "uTexture", "uTextureType"];
const vertexShaderSource = `
  precision mediump float;

  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoordinate;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uObjectMatrix;
  uniform mat4 uNormalMatrix;
  uniform float uPointSize;
  uniform int uPositionType; // 1: plane, 2: depth, basic

  varying vec4 vColor;
  varying vec3 vTransformedNormal;
  varying vec2 vTextureCoordinate;
  varying float depth;

  void main(void) {
    int kernelSize = 16; // kernel point length;
    float fkernelSize = float(kerenlSize);
    


    vColor = aVertexColor;
    gl_PointSize = uPointSize;

    vec4 transformedPosition = uObjectMatrix * vec4(aVertexPosition, 1.0);
    vec4 orthoPosition = uModelViewMatrix * vec4(transformedPosition.xyz, 1.0);
    vTransformedNormal = aVertexNormal;
    
    if (uPositionType == 1) {
      gl_Position = vec4(-1.0 + 2.0 * aVertexPosition.xy, 0.0, 1.0); // fixed position
    } else if (uPositionType == 2) {
      depth = -(orthoPosition.z / 10000.0);  
      gl_Position = uProjectionMatrix * orthoPosition; // depth
    } else if (uPositionType == 3) { // SSAO

    } else {
      gl_Position = uProjectionMatrix * orthoPosition;
    }
    
    vTextureCoordinate = aTextureCoordinate;
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  varying vec4 vColor;
  varying vec3 vTransformedNormal;
  varying vec2 vTextureCoordinate;
  varying float depth;

  uniform sampler2D uTexture;
  uniform int uTextureType; // default : color, 1 : texture, 2 : reverseY, 3 : depth
  
  vec3 encodeNormal(in vec3 normal) {
    return normal.xyz * 0.5 + 0.5;
  }
  vec3 decodeNormal(in vec3 normal){
    return normal * 2.0 - 1.0;
  }
  vec4 packDepth(float v) {
    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * v;
    enc = fract(enc);
    enc -= enc.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);
    return enc;
  }

  void main(void) {
    if (uTextureType == 1) {
      gl_FragColor = texture2D(uTexture, vec2(vTextureCoordinate.x, 1.0 - vTextureCoordinate.y));
    } else if (uTextureType == 2) {
      gl_FragColor = texture2D(uTexture, vTextureCoordinate);
    } else if (uTextureType == 3) {
      gl_FragColor = packDepth(depth);
    } else if (uTextureType == 4) {
      gl_FragColor = vec4(vColor.xyz, vColor.a);
    } else if (uTextureType == 5) {
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