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
  uniform int uFixedPosition;
  uniform int uTextureType;

  varying vec4 vColor;
  varying vec3 vLighting;
  varying vec2 vTextureCoordinate;
  void main(void) {
    vColor = aVertexColor;

    vec3 ambientLight = vec3(0.8, 0.8, 0.8);
    vec3 directionalLightColor = vec3(1, 1, 1);
    vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    vec4 transformedNormal = normalize(uNormalMatrix * vec4(aVertexNormal, 1.0));
    vec4 transformedPos = uObjectMatrix * vec4(aVertexPosition, 1.0);

    float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
    //vLighting = aVertexNormal;
    
    gl_PointSize = uPointSize;
    if (uFixedPosition == 1) {
      gl_Position = vec4(-1.0 + 2.0 * aVertexPosition.xy, 0.0, 1.0);
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

  uniform sampler2D uTexture;
  uniform int uTextureType; // 1:reversedY 2:basicY default:color

  void main(void) {
    if (uTextureType == 1) {
      vec4 textureColor = texture2D(uTexture, vec2(vTextureCoordinate.x, 1.0 - vTextureCoordinate.y));
      gl_FragColor = vec4(textureColor.rgb * vLighting, textureColor.a);
    } else if (uTextureType == 2) {
      vec4 textureColor = texture2D(uTexture, vTextureCoordinate);
      gl_FragColor = vec4(textureColor.rgb * vLighting, textureColor.a);
    } else {
      gl_FragColor = vec4(vColor.xyz * vLighting, vColor.a);
    }
  }
`;

export const Data = {
  vertexShaderSource: vertexShaderSource,
  fragmentShaderSource: fragmentShaderSource,
};