"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Buffer_js_1 = __importDefault(require("@/assets/webgl/Buffer.js"));
const Renderable_js_1 = __importDefault(require("@/assets/webgl/abstract/Renderable.js"));
class BatchObject extends Renderable_js_1.default {
    constructor(options) {
        super();
        this.init(options);
    }
    init(options) {
        this.name = "Untitled BatchObject";
        this.colors = options.colors;
        this.selectionColors = options.selectionColors;
        this.positions = options.positions;
        this.normals = options.normals;
        this.textures = options.textures;
        this.textureCoordinates = options.textureCoordinates;
    }
    render(gl, shaderInfo, frameBufferObjs) {
        let tm = this.getTransformMatrix();
        let rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        let buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        if (buffer.normalGlBuffer) {
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
            buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        }
        if (buffer.positionsGlBuffer) {
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
            buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        }
        if (buffer.colorGlBuffer) {
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
            buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        }
        if (buffer.selectionColorGlBuffer) {
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
            buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        }
        if (buffer.textureGlBuffer) {
            gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
            buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
        }
        frameBufferObjs.forEach((frameBufferObj) => {
            frameBufferObj.bind();
            if (buffer.indicesLength) {
                gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            }
            frameBufferObj.unbind();
        });
    }
    // overriding
    getBuffer(gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer_js_1.default(gl);
            let colors = this.colors;
            let selectionColors = this.selectionColors;
            let positions = this.positions;
            let normals = this.normals;
            let textureCoordinates = this.textureCoordinates;
            let textures = this.textures;
            this.buffer.texture = textures[0];
            let indices = new Uint16Array(positions.length / 3);
            this.buffer.indicesVBO = indices.map((obj, index) => index);
            this.buffer.positionsVBO = new Float32Array(positions);
            this.buffer.normalVBO = new Float32Array(normals);
            this.buffer.colorVBO = new Float32Array(colors);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors);
            this.buffer.textureVBO = new Float32Array(textureCoordinates);
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    }
}
exports.default = BatchObject;
