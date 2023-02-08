export default class ShaderProcess {
    constructor(gl, shader, globalOptions) {
        this._gl = gl;
        this._canvas = gl.canvas;
        this._shader = shader;
        this._shaderInfo = shader.shaderInfo;
        this._globalOptions = globalOptions;
    }
    preprocess() {
        throw new Error("preprocess() is abstract method. Abstract methods must be overriding.");
    }
    process() {
        throw new Error("process() is abstract method. Abstract methods must be overriding.");
    }
    postprocess() {
        throw new Error("postprocess() is abstract method. Abstract methods must be overriding.");
    }
    get gl() {
        return this._gl;
    }
    get canvas() {
        return this._canvas;
    }
    get shader() {
        return this._shader;
    }
    get globalOptions() {
        return this._globalOptions;
    }
    get shaderInfo() {
        return this._shaderInfo;
    }
}
