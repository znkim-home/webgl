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

  uniform int uPositionType;
  //uniform int uTextureType;

  varying vec4 vColor;
  varying vec3 vLighting;
  varying vec2 vTextureCoordinate;
  varying float depth;
  void main(void) {
    vColor = aVertexColor;

    vec3 ambientLight = vec3(0.8, 0.8, 0.8);
    vec3 directionalLightColor = vec3(1, 1, 1);
    vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    vec4 transformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 1.0));
    vec4 transformedPos = uObjectMatrix * vec4(aVertexPosition, 1.0);

    float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
    
    gl_PointSize = uPointSize;
    if (uPositionType == 1) {
      gl_Position = vec4(-1.0 + 2.0 * aVertexPosition.xy, 0.0, 1.0);
    } else if (uPositionType == 2) {
      vec4 orthoPosition = uModelViewMatrix * vec4(transformedPos.xyz, 1.0);
      gl_Position = uProjectionMatrix * orthoPosition;
      depth = -(orthoPosition.z / 10000.0);  
    } else {
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(transformedPos.xyz, 1.0);
    }
    
    vTextureCoordinate = aTextureCoordinate;
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  varying vec4 vColor;
  varying vec3 vLighting;
  varying vec2 vTextureCoordinate;
  varying float depth;

  uniform sampler2D uTexture;
  uniform int uTextureType;
  //uniform int uPositionType;

  vec4 packDepth( float v ) {
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
    } else {
      gl_FragColor = vec4(vColor.xyz * vLighting, vColor.a);
    }
  }
`;

export const Data = {
  vertexShaderSource: vertexShaderSource,
  fragmentShaderSource: fragmentShaderSource,
};