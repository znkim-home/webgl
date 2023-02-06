var Buffer = /** @class */ (function () {
    function Buffer(gl) {
        this._gl = gl;
    }
    Object.defineProperty(Buffer.prototype, "gl", {
        get: function () {
            return this._gl;
        },
        enumerable: false,
        configurable: true
    });
    Buffer.prototype.bindBuffer = function (glBuffer, size, attributeLocation) {
        if (size === void 0) { size = 3; }
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
        gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, 0, 0);
    };
    Buffer.prototype.createBuffer = function (data) {
        var gl = this.gl;
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    };
    Buffer.prototype.createIndexBuffer = function (data) {
        var gl = this.gl;
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    };
    Buffer.prototype.createTexture = function (image) {
        var gl = this.gl;
        var texWrap = gl.CLAMP_TO_EDGE;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texWrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texWrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        return texture;
    };
    Buffer.prototype.createNoiseTexture = function () {
        var NOISE_SIZE = 4;
        var pixels = new Uint8Array(NOISE_SIZE * NOISE_SIZE * NOISE_SIZE);
        for (var y = 0; y < NOISE_SIZE; y++) {
            for (var x = 0; x < NOISE_SIZE; x++) {
                pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 0] = Math.floor(255 * Math.random());
                pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 1] = Math.floor(255 * Math.random());
                pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 2] = Math.floor(255 * Math.random());
                pixels[(y * NOISE_SIZE + x) * NOISE_SIZE + 3] = Math.floor(255 * Math.random());
            }
        }
        var gl = this.gl;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, NOISE_SIZE, NOISE_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    };
    return Buffer;
}());
export default Buffer;
