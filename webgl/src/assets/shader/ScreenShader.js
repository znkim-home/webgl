const attributes = ["aVertexPosition", "aTextureCoordinate"];
const uniforms = ["uIsMain", "uScreenWidth", "uScreenHeight", "uMainTexture", "uAlbedoTexture", "uSelectionTexture", "uNormalTexture", "uDepthTexture"];
const vertexShaderSource = `
  precision mediump float;

  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoordinate;

  varying vec2 vTextureCoordinate;
  varying float depth;
  void main(void) {
    vTextureCoordinate = aTextureCoordinate;
    gl_Position = vec4(-1.0 + 2.0 * aVertexPosition.xy, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec2 vTextureCoordinate;
  
  uniform float uScreenWidth;    
  uniform float uScreenHeight;  
  uniform int uIsMain;

  uniform sampler2D uMainTexture;
  uniform sampler2D uAlbedoTexture;
  uniform sampler2D uSelectionTexture;
  uniform sampler2D uNormalTexture;
  uniform sampler2D uDepthTexture;

  vec4 decodeNormal(in vec4 normal) {
    return vec4(normal.xyz * 2.0 - 1.0, normal.w);
  }

  void main(void) {
    vec2 screenPos = vec2(gl_FragCoord.x / uScreenWidth, gl_FragCoord.y / uScreenHeight);
    float width = 1.0 / uScreenWidth;
	  float height = 1.0 / uScreenHeight;
    vec4 albedo = texture2D(uMainTexture, screenPos);

    vec4 selection = decodeNormal(texture2D(uSelectionTexture, screenPos));
    vec4 selectionBottom = decodeNormal(texture2D(uSelectionTexture, vec2(screenPos.x, screenPos.y + height)));
    vec4 selectionRight = decodeNormal(texture2D(uSelectionTexture, vec2(screenPos.x + width, screenPos.y)));
    vec4 selectionCross = decodeNormal(texture2D(uSelectionTexture, vec2(screenPos.x + width, screenPos.y + height)));

    vec4 normal = decodeNormal(texture2D(uNormalTexture, screenPos));
    vec4 normalBottom = decodeNormal(texture2D(uNormalTexture, vec2(screenPos.x, screenPos.y + height)));
    vec4 normalRight = decodeNormal(texture2D(uNormalTexture, vec2(screenPos.x + width, screenPos.y)));
    vec4 normalCross = decodeNormal(texture2D(uNormalTexture, vec2(screenPos.x + width, screenPos.y + height)));

    if (uIsMain == 1) {
      if (selection != selectionBottom || selection != selectionRight || selection != selectionCross) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else if (normal != normalBottom || normal != normalRight || normal != normalCross) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = albedo;
      }
    } else {
      vec4 textureColor = texture2D(uMainTexture, vTextureCoordinate);
      gl_FragColor = vec4(textureColor.rgb, textureColor.a);
    }
  }
`;

export const ScreenShader = {
  attributes: attributes,
  uniforms: uniforms,
  vertexShaderSource: vertexShaderSource,
  fragmentShaderSource: fragmentShaderSource,
};