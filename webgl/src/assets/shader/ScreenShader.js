const attributes = ["aVertexPosition", "aTextureCoordinate"];
const uniforms = ["uIsMain", "uSsaoKernel", "uScreenWidth", "uScreenHeight", "uProjectionMatrix", "uTangentOfHalfFovy", "uNear", "uFar", "uMainTexture", "uAlbedoTexture", "uSelectionTexture", "uNormalTexture", "uDepthTexture", "uNoiseTexture"];
const vertexShaderSource = `
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoordinate;

  varying vec2 vTextureCoordinate;
  void main(void) {
    vTextureCoordinate = aTextureCoordinate;
    gl_Position = vec4(-1.0 + 2.0 * aVertexPosition.xy, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  
  uniform int uIsMain;
  uniform float uScreenWidth;    
  uniform float uScreenHeight;  
  uniform float uTangentOfHalfFovy;
  uniform float uNear;
  uniform float uFar;

  uniform mat4 uProjectionMatrix;
  
  uniform sampler2D uMainTexture;
  uniform sampler2D uAlbedoTexture;
  uniform sampler2D uSelectionTexture;
  uniform sampler2D uNormalTexture;
  uniform sampler2D uDepthTexture;
  uniform sampler2D uNoiseTexture;

  uniform vec3 uSsaoKernel[16];

  varying vec2 vTextureCoordinate;

  vec4 decodeNormal(in vec4 normal) {
    return vec4(normal.xyz * 2.0 - 1.0, normal.w);
  }

  float unpackDepth(vec4 packedDepth) {
    return dot(packedDepth, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0));
  }

  vec3 getViewRay(vec2 tc, in float relFar) {
    float aspectRatio = uScreenWidth / uScreenHeight;
    float hfar = 2.0 * uTangentOfHalfFovy * relFar;
    float wfar = hfar * aspectRatio;    
    vec3 ray = vec3(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -relFar);    
    return ray;
  }   

  const int kernelSize = 16;
  const float radius = 50.0;

  //vec3 getOcclusion(vec3 origin, vec3 rotatedKernel) { // for debug
  float getOcclusion(vec3 origin, vec3 rotatedKernel) {
    float resultOcclusion = 1.0;
    vec3 sample = origin + (rotatedKernel * radius);
    vec4 offset = uProjectionMatrix * vec4(sample, 1.0);
    vec3 offsetCoord = vec3(offset.xyz);				
    offsetCoord.xyz /= offset.w;
    offsetCoord.xyz = offsetCoord.xyz * 0.5 + 0.5;
    if ((abs(offsetCoord.x) > 1.0 || abs(offsetCoord.y) > 1.0) && (abs(offsetCoord.x) < 0.0 || abs(offsetCoord.y) < 0.0)) {
        resultOcclusion = 0.0;
    } else {
      float depthBufferValue = unpackDepth(texture2D(uDepthTexture, offsetCoord.xy));
      float sampleZ = -sample.z;
      float bufferZ = depthBufferValue * uFar;
      float zDiff = abs(bufferZ - sampleZ);
      if (zDiff < radius) {
        if (bufferZ < sampleZ) {
          resultOcclusion = 0.0;
        }
      }
    }
    //return sample;
    return resultOcclusion;
  }

  //vec3 ssao(vec2 screenPos) { // for debug
  float ssao(in vec2 screenPos, inout float debugFloat, inout vec3 debugVec) {
    float occlusionSum = 0.0;
    float linearDepth = unpackDepth(texture2D(uDepthTexture, screenPos));
    float originDepth = linearDepth * uFar;
    vec3 origin = getViewRay(screenPos, originDepth);
    vec3 normal = decodeNormal(texture2D(uNormalTexture, screenPos)).xyz;

    vec2 noiseScale = vec2(uScreenWidth / 4.0, uScreenHeight / 4.0);
    vec3 rvec = texture2D(uNoiseTexture, screenPos.xy * noiseScale).xyz * 2.0 - 1.0;
    //vec3 rvec = vec3(0.7, 0.7, 0.7) * 2.0 - 1.0;
		vec3 tangent = normalize(rvec - normal * dot(rvec, normal));
		vec3 bitangent = normalize(cross(normal, tangent));
		mat3 tbn = mat3(tangent, bitangent, normal);   
		for (int i = 0; i < kernelSize; i++) {    	
      vec3 rotatedKernel = tbn * vec3(uSsaoKernel[i].x, uSsaoKernel[i].y, uSsaoKernel[i].z);
      occlusionSum += getOcclusion(origin, rotatedKernel);
    }
    debugVec = normal;
    return occlusionSum;

    /*vec3 rotatedKernel = tbn * vec3(uSsaoKernel[0].x, uSsaoKernel[0].y, uSsaoKernel[0].z);
    return getOcclusion(origin, rotatedKernel);
    //return bitangent;*/
  }

  void main(void) {
    float width = 1.0 / uScreenWidth;
	  float height = 1.0 / uScreenHeight;
    vec2 screenPos = vec2(gl_FragCoord.x / uScreenWidth, gl_FragCoord.y / uScreenHeight);
    vec4 albedo = texture2D(uMainTexture, screenPos);

    vec4 selection = decodeNormal(texture2D(uSelectionTexture, screenPos));
    vec4 selectionRight = decodeNormal(texture2D(uSelectionTexture, vec2(screenPos.x + width, screenPos.y)));
    vec4 selectionBottom = decodeNormal(texture2D(uSelectionTexture, vec2(screenPos.x, screenPos.y + height)));
    vec4 selectionCross = decodeNormal(texture2D(uSelectionTexture, vec2(screenPos.x + width, screenPos.y + height)));
    
    vec4 normal = decodeNormal(texture2D(uNormalTexture, screenPos));
    vec4 normalRight = decodeNormal(texture2D(uNormalTexture, vec2(screenPos.x + width, screenPos.y)));
    vec4 normalBottom = decodeNormal(texture2D(uNormalTexture, vec2(screenPos.x, screenPos.y + height)));
    vec4 normalCross = decodeNormal(texture2D(uNormalTexture, vec2(screenPos.x + width, screenPos.y + height)));

    float depth = unpackDepth(texture2D(uDepthTexture, screenPos));
    float depthRight = unpackDepth(texture2D(uDepthTexture, vec2(screenPos.x + width, screenPos.y)));
    float depthBottom = unpackDepth(texture2D(uDepthTexture, vec2(screenPos.x, screenPos.y + height)));
    float depthCross = unpackDepth(texture2D(uDepthTexture, vec2(screenPos.x + width, screenPos.y + height)));

    vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    vec3 directionalLightColor = vec3(0.9, 0.9, 0.9);
    vec3 directionalVector = normalize(vec3(0.6, 0.6, 0.9));
    float directional = max(dot(normal.xyz, directionalVector), 0.0);
    vec3 vLighting = ambientLight + (directionalLightColor * directional);

    

    if (uIsMain == 1) {
      bool isEdgeBySelection = selection != selectionBottom || selection != selectionRight || selection != selectionCross;
      bool isEdgeByNormal = normal != normalBottom || normal != normalRight || normal != normalCross;
      if (isEdgeByNormal || isEdgeBySelection) {
        gl_FragColor = vec4(vec3(0.2, 0.2, 0.2), 1.0);
      } else {
        float debugFloat = 1.0;
        vec3 debugVec = vec3(1.0);
        float ssaoResult = ssao(screenPos, debugFloat, debugVec) / float(kernelSize);
        //gl_FragColor = vec4(debugVec.xyz, 1.0);

        if (ssaoResult > 1.0) {
          ssaoResult = 1.0;
        } else if (ssaoResult < 0.0) {
          ssaoResult = 0.0;
        }
        vec3 objectColor = vec3(0.5, 0.5, 0.5);

        gl_FragColor = vec4(objectColor * ssaoResult, 1.0);

        //vec3 ssaoResult = ssao(screenPos);
        //gl_FragColor = vec4(ssaoResult.xyz, 1.0);
        //gl_FragColor = vec4(albedo.rgb * ssaoResult /* vLighting*/, albedo.a);
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