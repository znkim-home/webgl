const attributes = ["aVertexPosition", "aTextureCoordinate"];
const uniforms = ["uIsMain", "uSsaoKernel", "uScreenSize", "uNoiseScale", 
"uAspectRatio", "uProjectionMatrix", "uTangentOfHalfFovy", "uNearFar", 
"uMainTexture", "uAlbedoTexture", "uSelectionTexture", "uNormalTexture", 
"uDepthTexture", "uNoiseTexture", "uLightMapTexture", "uCameraTransformMatrix", "uSunModelViewMatrix", "uOrthographicMatrix", "uSunNormalMatrix",
"uEnableGlobalLight", "uEnableEdge", "uEnableSsao", "uSelectedObjectId"];

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
  uniform mat4 uCameraTransformMatrix;
  uniform mat4 uSunModelViewMatrix;
  uniform mat4 uOrthographicMatrix;
  uniform mat4 uSunNormalMatrix;

  uniform sampler2D uMainTexture;
  uniform sampler2D uAlbedoTexture;
  uniform sampler2D uSelectionTexture;
  uniform sampler2D uNormalTexture;
  uniform sampler2D uDepthTexture;
  uniform sampler2D uLightMapTexture;
  uniform sampler2D uNoiseTexture;
  uniform vec3 uSsaoKernel[16];

  uniform int uEnableGlobalLight;
  uniform int uEnableEdge;
  uniform int uEnableSsao;
  uniform float uSelectedObjectId;

  varying vec2 vTextureCoordinate;
  
  const int kernelSize = 16;
  const float fKernelSize = float(kernelSize);

  vec4 decodeNormal(in vec4 normal) {
    return vec4(normal.xyz * 2.0 - 1.0, normal.w);
  }
  float convertColorToId(vec4 color) {
    return (color.r * 255.0 * 16777216.0) + (color.g * 255.0 * 65536.0) + (color.b * 255.0 * 256.0) + (color.a * 255.0);
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
    //return texture2D(uLightMapTexture, screenPos);
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
      occlusionA += getOcclusion(origin, rotatedKernel, 8.5);
      occlusionB += getOcclusion(origin, rotatedKernel, 16.0);
      occlusionC += getOcclusion(origin, rotatedKernel, 32.0);
    }

    float tolerance = 0.80;
    float result = (occlusionA + occlusionB + occlusionC) / (fKernelSize * 3.0);
    if (result > tolerance) {
      result = 1.0;
    }
    //return result;

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
    vec2 leftPos = vec2(screenPos.x - width, screenPos.y);
    
    float selection = convertColorToId(getSelection(screenPos));
    float selectionRight = convertColorToId(getSelection(rightPos));
    float selectionBottom = convertColorToId(getSelection(bottomPos));
    float selectionCross = convertColorToId(getSelection(crossPos));
    float selectionLeft = convertColorToId(getSelection(leftPos));

    vec4 normal = decodeNormal(getNormal(screenPos));
    vec4 normalRight = decodeNormal(getNormal(rightPos));
    vec4 normalBottom = decodeNormal(getNormal(bottomPos));
    vec4 normalCross = decodeNormal(getNormal(crossPos));

    float compareOffset = 0.3;
    bool normalCompareRight = compareOffset < compareNormalOffset(normal, normalRight);
    bool normalCompareBottom = compareOffset < compareNormalOffset(normal, normalBottom);
    bool normalCompareCross = compareOffset < compareNormalOffset(normal, normalCross);

    bool isEdgeByNormalCompare = normalCompareRight || normalCompareBottom || normalCompareCross;
    bool isEdgeBySelection = selection != selectionBottom || selection != selectionRight || selection != selectionCross || selection != selectionLeft;

    return isEdgeByNormalCompare || isEdgeBySelection;
  }

  bool isShadow(vec2 screenPos) {
    bool result = false;

    float linearDepth = unpackDepth(getDepth(screenPos));
    float originDepth = linearDepth * uNearFar.y;
    vec3 positionCC = getViewRay(screenPos, originDepth);
    vec4 positionWC = uCameraTransformMatrix * vec4(positionCC, 1.0);
    vec4 positionSC = uSunModelViewMatrix * vec4(positionWC.xyz, 1.0);

    positionSC = uOrthographicMatrix * positionSC;
    vec3 positionUnitarySCaux = positionSC.xyz / positionSC.w; // Range : -1.0 ~ 1.0
    vec3 positionUnitarySC = positionUnitarySCaux * 0.5 + 0.5; // Range = 0.0 ~ 1.0

    if (positionUnitarySC.z > 0.9999) {
      return result;
    }
    if (positionUnitarySC.x > 1.0 || positionUnitarySC.x < 0.0 || positionUnitarySC.y > 1.0 || positionUnitarySC.y < 0.0) {
      return result;
    }

    vec4 fromDepthSunTextureVec4 = texture2D(uLightMapTexture, positionUnitarySC.xy) ;
    fromDepthSunTextureVec4 = fromDepthSunTextureVec4 * 1.001;
    float fromDepthSunTexture = unpackDepth(fromDepthSunTextureVec4);

    result = positionUnitarySC.z > fromDepthSunTexture;
    return result;
  }

  void main(void) {
    float width = 1.0 / uScreenSize.x;
	  float height = 1.0 / uScreenSize.y;
    vec2 screenPos = vec2(gl_FragCoord.x / uScreenSize.x, gl_FragCoord.y / uScreenSize.y);

    vec4 albedo = getAlbedo(screenPos);
    vec4 normal = decodeNormal(getNormal(screenPos));

    vec4 selectionColor = getSelection(screenPos);
    float selection = convertColorToId(getSelection(screenPos));

    vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    vec3 directionalLightColor = vec3(0.9, 0.9, 0.9);
    vec3 directionalVector = normalize(vec3(0.6, 0.6, 0.9));
    float directional = max(dot(normal.xyz, directionalVector), 0.0);
    vec3 vLighting = ambientLight + (directionalLightColor * directional);

    if (uIsMain == 1) {
      vec3 result = albedo.xyz;
      
      if (uEnableSsao == 1) {
        //float ssaoResult = getSSAO(screenPos);
        float tolerance = 0.80;
        vec4 ssaoResult = getSSAO(screenPos);

        if (ssaoResult.x < tolerance) {
          result = result * ssaoResult.x;
        }
        if (ssaoResult.y < tolerance) {
          result = result * (ssaoResult.y + 0.1);
        }
        if (ssaoResult.z < tolerance) {
          result = result * (ssaoResult.z + 0.2);
        }
        //result = result * ssaoResult;
      }

      //result = result * vLighting;
      if (uEnableGlobalLight == 1 && isShadow(screenPos)) {
        result = result * 0.5;
      }

      if (selection == uSelectedObjectId) {
        result.b = result.b * 1.5;
      }
      if (uEnableEdge == 1 && isEdge(screenPos)) {
        result = result * 0.5;
        if (selection == uSelectedObjectId) {
          result.b = 1.0;
        }
      }
      gl_FragColor = vec4(result, 1.0);
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