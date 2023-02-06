var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Buffer from '@/Buffer.js';
import Renderable from '@/abstract/Renderable.js';
var BatchObject = /** @class */ (function (_super) {
    __extends(BatchObject, _super);
    function BatchObject(options) {
        var _this = _super.call(this) || this;
        _this.init(options);
        return _this;
    }
    BatchObject.prototype.init = function (options) {
        this.name = "Untitled BatchObject";
        this.colors = options.colors;
        this.selectionColors = options.selectionColors;
        this.positions = options.positions;
        this.normals = options.normals;
        this.textures = options.textures;
        this.textureCoordinates = options.textureCoordinates;
    };
    BatchObject.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var tm = this.getTransformMatrix();
        var rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        var buffer = this.getBuffer(gl);
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
        frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.bind();
            if (buffer.indicesLength) {
                gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            }
            frameBufferObj.unbind();
        });
    };
    // overriding
    BatchObject.prototype.getBuffer = function (gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var colors = this.colors;
            var selectionColors = this.selectionColors;
            var positions = this.positions;
            var normals = this.normals;
            var textureCoordinates = this.textureCoordinates;
            var textures = this.textures;
            this.buffer.texture = textures[0];
            var indices = new Uint16Array(positions.length / 3);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
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
    };
    return BatchObject;
}(Renderable));
export default BatchObject;
