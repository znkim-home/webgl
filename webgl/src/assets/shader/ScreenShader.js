const attributes = ["aVertexPosition", "aTextureCoordinate"];
const uniforms = ["uIsMain", "uSsaoKernel", "uScreenSize", "uNoiseScale", "uAspectRatio", "uProjectionMatrix", "uTangentOfHalfFovy", "uNearFar", "uMainTexture", "uAlbedoTexture", "uSelectionTexture", "uNormalTexture", "uDepthTexture", "uNoiseTexture"];
const vertexShaderSource = `
  #pragma vscode_glsllint_stage : vert
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoordinate;

  varying vec2 vTextureCoordinate;
  void main(void) {
    vTextureCoordinate = aTextureCoordinate;
    gl_Position = vec4(aVertexPosition.xy * 2.0 - 1.0, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  #pragma vscode_glsllint_stage : frag
  precision highp float;
  
  uniform int uIsMain;
  uniform float uTangentOfHalfFovy;
  uniform float uAspectRatio;

  uniform vec2 uScreenSize;  
  uniform vec2 uNearFar;
  uniform vec2 uNoiseScale;
  uniform mat4 uProjectionMatrix;
  
  uniform sampler2D uMainTexture;
  uniform sampler2D uAlbedoTexture;
  uniform sampler2D uSelectionTexture;
  uniform sampler2D uNormalTexture;
  uniform sampler2D uDepthTexture;
  uniform sampler2D uNoiseTexture;
  uniform vec3 uSsaoKernel[16];

  varying vec2 vTextureCoordinate;

  const int kernelSize = 16;
  const float fKernelSize = float(kernelSize);

  vec4 decodeNormal(in vec4 normal) {
    return vec4(normal.xyz * 2.0 - 1.0, normal.w);
  }
  float convertColorToId(vec4 color) {
    return (color.r * 16777216.0) + (color.g * 65536.0) + (color.b * 256.0) + (color.a);
  }
  float unpackDepth(vec4 packedDepth) {
    return dot(packedDepth, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0));
  }
  vec3 getViewRay(vec2 tc, in float relFar) {
    float hfar = 2.0 * uTangentOfHalfFovy * relFar;
    float wfar = hfar * uAspectRatio;    
    vec3 ray = vec3(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -relFar);    
    return ray;
  }
  vec4 getAlbedo(vec2 screenPos) {
    return texture2D(uAlbedoTexture, screenPos);
  }
  vec4 getSelection(vec2 screenPos) {
    return texture2D(uSelectionTexture, screenPos);
  }
  vec4 getNormal(vec2 screenPos) {
    return texture2D(uNormalTexture, screenPos);
  }
  vec4 getDepth(vec2 screenPos) {
    return texture2D(uDepthTexture, screenPos);
  }

  float getOcclusion(vec3 origin, vec3 rotatedKernel, float radius) {
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
      float bufferZ = depthBufferValue * uNearFar.y;
      float zDiff = abs(bufferZ - sampleZ);
      if (zDiff < radius) {
        if (bufferZ < sampleZ) {
          resultOcclusion = 0.0;
        }
      }
    }
    return resultOcclusion;
  }

  vec4 getSSAO(in vec2 screenPos) {
    float occlusionA = 0.0;
    float occlusionB = 0.0;
    float occlusionC = 0.0;

    float linearDepth = unpackDepth(getDepth(screenPos));
    float originDepth = linearDepth * uNearFar.y;
    vec3 origin = getViewRay(screenPos, originDepth);
    vec3 normal = decodeNormal(texture2D(uNormalTexture, screenPos)).xyz;

    vec3 rvec = texture2D(uNoiseTexture, screenPos.xy * uNoiseScale).xyz * 2.0 - 1.0;
		vec3 tangent = normalize(rvec - normal * dot(rvec, normal));
		vec3 bitangent = normalize(cross(normal, tangent));
		mat3 tbn = mat3(tangent, bitangent, normal);   
		for (int i = 0; i < kernelSize; i++) {    	
      vec3 rotatedKernel = tbn * vec3(uSsaoKernel[i].x, uSsaoKernel[i].y, uSsaoKernel[i].z);
      occlusionA += getOcclusion(origin, rotatedKernel, 5.0);
      occlusionB += getOcclusion(origin, rotatedKernel, 10.0);
      occlusionC += getOcclusion(origin, rotatedKernel, 30.0);
    }
    return vec4(occlusionA / fKernelSize, occlusionB / fKernelSize, occlusionC / fKernelSize, 1.0);
  }

  float compareNormalOffset(in vec4 normalA, in vec4 normalB) {
    float result = 0.0; 
    result += abs(normalA.x - normalB.x);
    result += abs(normalA.y - normalB.y);
    result += abs(normalA.z - normalB.z);
    return result;
  }

  bool isEdge(vec2 screenPos) {
    float width = 1.0 / uScreenSize.x;
	  float height = 1.0 / uScreenSize.y;
    vec2 rightPos = vec2(screenPos.x + width, screenPos.y);
    vec2 bottomPos = vec2(screenPos.x, screenPos.y + height);
    vec2 crossPos = vec2(screenPos.x + width, screenPos.y + height);

    float selection = convertColorToId(getSelection(screenPos));
    float selectionRight = convertColorToId(getSelection(rightPos));
    float selectionBottom = convertColorToId(getSelection(bottomPos));
    float selectionCross = convertColorToId(getSelection(crossPos));

    vec4 normal = decodeNormal(getNormal(screenPos));
    vec4 normalRight = decodeNormal(getNormal(rightPos));
    vec4 normalBottom = decodeNormal(getNormal(bottomPos));
    vec4 normalCross = decodeNormal(getNormal(crossPos));

    float compareOffset = 0.3;
    bool normalCompareRight = compareOffset < compareNormalOffset(normal, normalRight);
    bool normalCompareBottom = compareOffset < compareNormalOffset(normal, normalBottom);
    bool normalCompareCross = compareOffset < compareNormalOffset(normal, normalCross);

    bool isEdgeByNormalCompare = normalCompareRight || normalCompareBottom || normalCompareCross;
    bool isEdgeBySelection = selection != selectionBottom || selection != selectionRight || selection != selectionCross;

    return isEdgeByNormalCompare || isEdgeBySelection;
  }

  void main(void) {
    float width = 1.0 / uScreenSize.x;
	  float height = 1.0 / uScreenSize.y;
    vec2 screenPos = vec2(gl_FragCoord.x / uScreenSize.x, gl_FragCoord.y / uScreenSize.y);

    vec4 albedo = getAlbedo(screenPos);
    vec4 normal = decodeNormal(getNormal(screenPos));

    vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    vec3 directionalLightColor = vec3(0.9, 0.9, 0.9);
    vec3 directionalVector = normalize(vec3(0.6, 0.6, 0.9));
    float directional = max(dot(normal.xyz, directionalVector), 0.0);
    vec3 vLighting = ambientLight + (directionalLightColor * directional);

    if (uIsMain == 1) {
      if (isEdge(screenPos)) {
        gl_FragColor = vec4(vec3(0.1, 0.1, 0.1), 1.0);
      } else {
        vec4 ssaoResult = getSSAO(screenPos);
        gl_FragColor = vec4(albedo.xyz * vLighting * ssaoResult.z, 1.0);
        //vec3 objectColor = vec3(0.5, 0.5, 0.5);
        //gl_FragColor = vec4(objectColor * vLighting * ssaoResult.z, 1.0);
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