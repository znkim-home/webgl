
declare global {
  interface ShaderProcessInterface {
    preprocess(): void;
    process(): void;
    postprocess(): void;
  }
}

export default class ShaderProcess implements ShaderProcessInterface {
  _gl: WebGLRenderingContext;
  _canvas: HTMLCanvasElement;
  _shader: any;
  _shaderInfo: any;

  get gl(): WebGLRenderingContext {
    return this._gl;
  }
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }
  get shader(): any {
    return this._shader;
  }
  get shaderInfo(): any {
    return this._shaderInfo;
  }

  constructor(gl: WebGLRenderingContext, shader: any) {
    this._gl = gl;
    this._canvas = <HTMLCanvasElement> gl.canvas;
    this._shader = shader;
    this._shaderInfo = shader.shaderInfo;
  }
  preprocess(): void {
    throw new Error("preprocess() is abstract method. Abstract methods must be overriding.");
  }
  process(): void {
    throw new Error("process() is abstract method. Abstract methods must be overriding.");
  }
  postprocess(): void {
    throw new Error("postprocess() is abstract method. Abstract methods must be overriding.");
  }
}