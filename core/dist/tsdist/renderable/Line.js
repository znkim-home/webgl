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
import { vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(coordinates, options) {
        var _this = _super.call(this) || this;
        _this.init(coordinates, options);
        return _this;
    }
    Line.prototype.init = function (coordinates, options) {
        this.length = 0;
        this.name = "Untitled Line";
        if (coordinates)
            this.coordinates = coordinates;
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
    };
    Line.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var tm = this.getTransformMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        // todo
        gl.disable(gl.DEPTH_TEST);
        gl.drawElements(gl.LINE_STRIP, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
        gl.enable(gl.DEPTH_TEST);
    };
    Line.prototype.getBuffer = function (gl) {
        var _this = this;
        if (this.buffer === undefined || this.length != this.coordinates.length || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            this.coordinates.forEach(function (coordinate) {
                coordinate.forEach(function (value) { return positions_1.push(value); });
                _this.color.forEach(function (value) { return colors_1.push(value); });
                _this.selectionColor.forEach(function (value) { return selectionColors_1.push(value); });
            });
            this.length = this.coordinates.length;
            var indices = new Uint16Array(this.length);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    };
    return Line;
}(Renderable));
export default Line;
