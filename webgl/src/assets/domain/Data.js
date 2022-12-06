const vertexShaderSource = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoordinate;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uObjectMatrix;
  uniform mat4 uNormalMatrix;
  uniform float uPointSize;
  
  varying lowp vec4 vColor;
  varying lowp vec3 vLighting;
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
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(transformedPos.xyz, 1.0);

    vTextureCoordinate = aTextureCoordinate;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  
  varying vec4 vColor;
  varying vec3 vLighting;
  varying vec2 vTextureCoordinate;

  uniform sampler2D uTexture;
  uniform int uTextureBoolean;

  void main(void) {
    if (uTextureBoolean == 1) {
      //vec4 textureColor = texture2D(uTexture, vTextureCoordinate);
      vec4 textureColor = texture2D(uTexture, vec2(vTextureCoordinate.x, 1.0 - vTextureCoordinate.y));
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