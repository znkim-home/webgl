declare global {
  interface LocalOptions {
    fovyDegree: number;
    aspect: number;
    near: number;
    far: number;
    pointSize: number;
    lineWidth: number;
    debugMode: boolean;
    cullFace: boolean;
    depthTest: boolean;
    enableSsao: boolean;
    enableEdge: boolean;
    enableGlobalLight: boolean;
    selectedObjectId: number;
  }
  interface GlobalOptions {
    fovyDegree: number;
    aspect: number;
    near: number;
    far: number;
    pointSize: number;
    lineWidth: number;
    debugMode: boolean;
    cullFace: boolean;
    depthTest: boolean;
    enableSsao: boolean;
    enableEdge: boolean;
    enableGlobalLight: boolean;
    selectedObjectId: number;
    wireFrame: boolean;
    drawElementsType: number;
  }
  interface BufferSet {
    indicesVBO: Uint16Array;
    positionsVBO: Float32Array;
    colorVBO: Float32Array;
    selectionColorVBO: Float32Array;
    normalVBO: Float32Array;
    textureVBO: Float32Array;
    texture: WebGLTexture;
    
    postionsGlBuffer: WebGLBuffer;
    colorGlBuffer: WebGLBuffer;
    selectionColorGlBuffer: WebGLBuffer;
    normalGlBuffer: WebGLBuffer;
    indicesGlBuffer: WebGLBuffer;
    textureGlBuffer: WebGLBuffer;
    indicesLength: number;
  }
  interface Math {
    radian(a: number): number;
    degree(a: number): number;
    randomInt(a: number): number;
  }
  interface Array<T> {
    get(a: number): T;
    getPrev(a: number): T;
    getNext(a: number): T;
    getPrevIndex(a: number): number;
    getNextIndex(a: number): number;
    loopIndex(a: number): T;
  }
  interface CustomScreen {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  interface RenderableListInterface {
    get(): any;
    set(renderableObjects: Array<any>): void;
  }
  interface BufferInterface {
    indicesLength?: number;
    indicesVBO?: Uint16Array;
    indicesGlBuffer?: WebGLBuffer;
    positionsVBO?: Float32Array;
    positionsGlBuffer?: WebGLBuffer;
    normalVBO?: Float32Array;
    normalGlBuffer?: WebGLBuffer;
    colorVBO?: Float32Array;
    colorGlBuffer?: WebGLBuffer;
    selectionColorVBO?: Float32Array;
    selectionColorGlBuffer?: WebGLBuffer;
    texture?: WebGLTexture;
    textureVBO?: Float32Array;
    textureGlBuffer?: WebGLBuffer;
    bindBuffer(glBuffer: WebGLBuffer, size: number, attributeLocation: number): void;
    createBuffer(array: any): WebGLBuffer;
    createIndexBuffer(array: any): WebGLBuffer;
  }

  interface ShaderObjectInterface {
    vertexShaderSource: string;
    fragmentShaderSource: string;
    attributes: string[];
    uniforms: string[];
  }
  interface ShaderInfoInterface {
    shaderProgram: WebGLProgram;
    fragmentShader: WebGLShader;
    vertexShader: WebGLShader;
    attributeLocations: any;
    uniformLocations: any;
  }
}

export {};