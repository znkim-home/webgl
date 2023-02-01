"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix"); // eslint-disable-line no-unused-vars
class FrameBufferObject {
    /**
     * constructor
     * @param {*} gl
     * @param {*} options
     */
    constructor(gl, canvas, shaderInfo, options, globalOptions) {
        this.gl = gl;
        this.canvas = canvas;
        this.shaderInfo = shaderInfo;
        this.frameBuffer = gl.createFramebuffer();
        this.renderBuffer = gl.createRenderbuffer();
        this.texture = gl.createTexture();
        this.options = options;
        this.globalOptions = globalOptions;
        this.init();
    }
    init() {
        var _a, _b, _c, _d, _e;
        const gl = this.gl;
        const canvas = this.canvas;
        this.textureType = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.textureType) ? this.options.textureType : 0;
        this.clearColor = ((_b = this.options) === null || _b === void 0 ? void 0 : _b.clearColor) ? this.options.clearColor : gl_matrix_1.vec3.fromValues(1.0, 1.0, 1.0);
        this.name = ((_c = this.options) === null || _c === void 0 ? void 0 : _c.name) ? this.options.name : "Untitled FrameBuffer";
        this.widths = new Int32Array([((_d = this.options) === null || _d === void 0 ? void 0 : _d.width) ? this.options.width : canvas.width]);
        this.heights = new Int32Array([((_e = this.options) === null || _e === void 0 ? void 0 : _e.height) ? this.options.height : canvas.height]);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.widths[0], this.heights[0], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.widths[0], this.heights[0]);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error("Incomplete frame buffer object.");
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    clear() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    bind(shaderInfo = this.shaderInfo) {
        const gl = this.gl;
        gl.uniform1i(shaderInfo.uniformLocations.textureType, this.textureType);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    }
    unbind() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    getNormal(x, y) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        const pixels = new Uint8Array(4);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        const pixelsF32 = new Float32Array([pixels[0] / 255.0, pixels[1] / 255.0, pixels[2] / 255.0, pixels[3] / 255.0]);
        return this.decodeNormal(pixelsF32);
    }
    getColor(x, y) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        const pixels = new Uint8Array(4);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return this.convertColorToId(pixels);
    }
    getDepth(x, y) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        const pixels = new Uint8Array(4);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        const pixelsF32 = new Float32Array([pixels[0] / 255.0, pixels[1] / 255.0, pixels[2] / 255.0, pixels[3] / 255.0]);
        const result = this.unpackDepth(pixelsF32) * this.globalOptions.far;
        return result;
    }
    convertIdToColor(id) {
        const calc = (value, div) => Math.floor(value / div) % 256 / 255;
        return gl_matrix_1.vec4.fromValues(calc(id, 16777216), calc(id, 65536), calc(id, 256), calc(id, 1));
    }
    convertColorToId(color) {
        return (color[0] * 16777216) + (color[1] * 65536) + (color[2] * 256) + (color[3]);
    }
    convertColor255ToId(color) {
        return (color[0] * 16777216 * 255) + (color[1] * 65536 * 255) + (color[2] * 256 * 255) + (color[3] * 255);
    }
    unpackDepth(rgba_depth) {
        return rgba_depth[0] + rgba_depth[1] * 1.0 / 255.0 + rgba_depth[2] * 1.0 / 65025.0 + rgba_depth[3] * 1.0 / 16581375.0;
    }
    decodeNormal(normal) {
        let result = gl_matrix_1.vec3.fromValues(normal[0] * 2.0 - 1.0, normal[1] * 2.0 - 1.0, normal[2] * 2.0 - 1.0);
        gl_matrix_1.vec3.normalize(result, result);
        return result;
    }
}
exports.default = FrameBufferObject;
