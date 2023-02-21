const attributes = ["aVertexPosition", "aTextureCoordinate"];
const uniforms = ["uModelViewMatrix", "uProjectionMatrix", "uObjectMatrix", "uCubeTexture"];
const vertexShaderSource = `
  attribute vec3 aVertexPosition;
  attribute vec3 aTextureCoordinate;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uObjectMatrix;

  varying vec3 vTextureCoordinate;

  vec4 getOrthoPosition() {
    vec4 transformedPosition = uObjectMatrix * vec4(aVertexPosition, 1.0);
    vec4 orthoPosition = uModelViewMatrix * vec4(transformedPosition.xyz, 1.0);
    return orthoPosition;
  }

  void main(void) {
    vec4 orthoPosition = getOrthoPosition();
    gl_Position = uProjectionMatrix * orthoPosition;
    vTextureCoordinate = aTextureCoordinate;
  }
`;
const fragmentShaderSource = `
  precision highp float;

  varying vec3 vTextureCoordinate;
  uniform samplerCube uCubeTexture;

  void main(void) {
    gl_FragColor = textureCube(uCubeTexture, vec3(vTextureCoordinate.x, vTextureCoordinate.y, vTextureCoordinate.z));
  }
`;
export const SkyBoxShader = {
    attributes: attributes,
    uniforms: uniforms,
    vertexShaderSource: vertexShaderSource,
    fragmentShaderSource: fragmentShaderSource,
};
