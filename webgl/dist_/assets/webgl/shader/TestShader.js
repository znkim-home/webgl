const attributes = ["aVertexPosition", "aVertexColor"];
const uniforms = ["uModelViewMatrix", "uProjectionMatrix", "uObjectMatrix"];
const vertexShaderSource = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uObjectMatrix;

  varying vec4 vColor;

  vec4 getOrthoPosition() {
    vec4 transformedPosition = uObjectMatrix * vec4(aVertexPosition, 1.0);
    vec4 orthoPosition = uModelViewMatrix * vec4(transformedPosition.xyz, 1.0);
    return orthoPosition;
  }

  void main(void) {
    vColor = aVertexColor;
    vec4 orthoPosition = getOrthoPosition();
    gl_Position = uProjectionMatrix * orthoPosition;
  }
`;
const fragmentShaderSource = `
  precision highp float;
  varying vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;
export const TestShader = {
    attributes: attributes,
    uniforms: uniforms,
    vertexShaderSource: vertexShaderSource,
    fragmentShaderSource: fragmentShaderSource,
};
