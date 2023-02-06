var Shader = /** @class */ (function () {
    function Shader(gl) {
        this._gl = gl;
    }
    Object.defineProperty(Shader.prototype, "gl", {
        get: function () {
            return this._gl;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Shader.prototype, "shaderInfo", {
        get: function () {
            return this._shaderInfo;
        },
        enumerable: false,
        configurable: true
    });
    Shader.prototype.init = function (shaderObject) {
        var gl = this.gl;
        var vertexShader = this.createShader(gl.VERTEX_SHADER, shaderObject.vertexShaderSource);
        var fragmentShader = this.createShader(gl.FRAGMENT_SHADER, shaderObject.fragmentShaderSource);
        var shaderProgram = this.createShaderProgram(vertexShader, fragmentShader);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program.");
            return;
        }
        gl.useProgram(shaderProgram);
        var attributeLocations = {};
        shaderObject.attributes.forEach(function (attribute) {
            if (attribute[0] !== 'a') {
                throw new Error("Shader: attribute variable name is incorrect.");
            }
            var result = attribute.replace('a', '');
            result = result.replace(/^[A-Z]/, function (char) { return char.toLowerCase(); });
            attributeLocations[result] = gl.getAttribLocation(shaderProgram, attribute);
        });
        var uniformLocations = {};
        shaderObject.uniforms.forEach(function (uniform) {
            if (uniform[0] !== 'u') {
                throw new Error("Shader: uniform variable name is incorrect.");
            }
            var result = uniform.replace('u', '');
            result = result.replace(/^[A-Z]/, function (char) { return char.toLowerCase(); });
            uniformLocations[result] = gl.getUniformLocation(shaderProgram, uniform);
        });
        this._shaderInfo = {
            shaderProgram: shaderProgram,
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
            attributeLocations: attributeLocations,
            uniformLocations: uniformLocations,
        };
    };
    Shader.prototype.createShader = function (shaderType, shaderSource) {
        var gl = this.gl;
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!status) {
            var message = "An error occurred compiling the shaders:  ".concat(gl.getShaderInfoLog(shader));
            throw new Error(message);
        }
        return shader;
    };
    Shader.prototype.createShaderProgram = function (vertexShader, fragmentShader) {
        var gl = this.gl;
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        return shaderProgram;
    };
    Shader.prototype.useProgram = function () {
        this.gl.useProgram(this.shaderInfo.shaderProgram);
    };
    return Shader;
}());
export default Shader;
