var ShaderProcess = /** @class */ (function () {
    function ShaderProcess(gl, shader, globalOptions) {
        this._gl = gl;
        this._canvas = gl.canvas;
        this._shader = shader;
        this._shaderInfo = shader.shaderInfo;
        this._globalOptions = globalOptions;
    }
    ShaderProcess.prototype.preprocess = function () {
        throw new Error("preprocess() is abstract method. Abstract methods must be overriding.");
    };
    ShaderProcess.prototype.process = function () {
        throw new Error("process() is abstract method. Abstract methods must be overriding.");
    };
    ShaderProcess.prototype.postprocess = function () {
        throw new Error("postprocess() is abstract method. Abstract methods must be overriding.");
    };
    Object.defineProperty(ShaderProcess.prototype, "gl", {
        get: function () {
            return this._gl;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderProcess.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderProcess.prototype, "shader", {
        get: function () {
            return this._shader;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderProcess.prototype, "globalOptions", {
        get: function () {
            return this._globalOptions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShaderProcess.prototype, "shaderInfo", {
        get: function () {
            return this._shaderInfo;
        },
        enumerable: false,
        configurable: true
    });
    return ShaderProcess;
}());
export default ShaderProcess;
