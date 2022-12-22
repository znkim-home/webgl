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
  //uniform int uTextureType;

  varying vec4 vColor;
  varying vec3 vLighting;
  varying vec3 vTransformedNormal;
  varying vec2 vTextureCoordinate;
  varying float depth;
  void main(void) {
    vColor = aVertexColor;
    gl_PointSize = uPointSize;

    vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    vec3 directionalLightColor = vec3(0.8, 0.8, 0.8);
    vec3 directionalVector = normalize(vec3(0.6, 0.6, 0.6));

    //vec4 transformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 1.0));

    vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    vec4 transformedPosition = uObjectMatrix * vec4(aVertexPosition, 1.0);
    vec4 orthoPosition = uModelViewMatrix * vec4(transformedPosition.xyz, 1.0);

    vTransformedNormal = aVertexNormal;

    float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);

    if (uPositionType == 1) {
      gl_Position = vec4(-1.0 + 2.0 * aVertexPosition.xy, 0.0, 1.0);
    } else if (uPositionType == 2) {
      gl_Position = uProjectionMatrix * orthoPosition;
      depth = -(orthoPosition.z / 10000.0);  
    } else if (uPositionType == 3) {
      gl_Position = uProjectionMatrix * orthoPosition;
    } else {
      gl_Position = uProjectionMatrix * orthoPosition;
    }
    
    vTextureCoordinate = aTextureCoordinate;
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  varying vec4 vColor;
  varying vec3 vLighting;
  varying vec3 vTransformedNormal;
  varying vec2 vTextureCoordinate;
  varying float depth;

  uniform sampler2D uTexture;
  uniform int uTextureType; // default : color, 1 : texture, 2 : reverseY, 3 : depth
  //uniform int uPositionType;

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
      vec4 textureColor = texture2D(uTexture, vec2(vTextureCoordinate.x, 1.0 - vTextureCoordinate.y));
      gl_FragColor = vec4(textureColor.rgb * vLighting, textureColor.a);
    } else if (uTextureType == 2) {
      vec4 textureColor = texture2D(uTexture, vTextureCoordinate);
      gl_FragColor = vec4(textureColor.rgb * vLighting, textureColor.a);
    } else if (uTextureType == 3) {
      vec4 textureColor = texture2D(uTexture, vTextureCoordinate);
      gl_FragColor = packDepth(depth);
    } else if (uTextureType == 4) {
      gl_FragColor = vec4(vColor.xyz, vColor.a);
    } else if (uTextureType == 5) {
      gl_FragColor = vec4(encodeNormal(vTransformedNormal), 1.0);
      //gl_FragColor = vec4(vTransformedNormal.xyz * 0.5 + 0.5, 1.0);
      //gl_FragColor = vec4(vLighting, vColor.a);
    } else {
      gl_FragColor = vec4(vColor.xyz * vLighting, vColor.a);
    }
  }
`;

export const Data = {
  vertexShaderSource: vertexShaderSource,
  fragmentShaderSource: fragmentShaderSource,
};