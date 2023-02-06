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
import Triangle from '@/geometry/Triangle.js';
import { vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
var Screen = /** @class */ (function (_super) {
    __extends(Screen, _super);
    function Screen(coordinates, options) {
        var _this = _super.call(this) || this;
        _this.forDebug = false;
        _this.init(coordinates, options);
        return _this;
    }
    Screen.prototype.init = function (coordinates, options) {
        this.length = 0;
        this.name = "Untitled Screen";
        if (coordinates)
            this.coordinates = coordinates;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if (options === null || options === void 0 ? void 0 : options.forDebug)
            this.forDebug = options.forDebug;
        if (options === null || options === void 0 ? void 0 : options.textureLocation)
            this.textureLocation = options.textureLocation;
    };
    Screen.prototype.setGlTextureNumber = function (glTextureNumber) {
        this.glTextureNumber = glTextureNumber;
    };
    Screen.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
        buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
        gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
    };
    Screen.prototype.getBuffer = function (gl) {
        var _this = this;
        this.dirty = (this.buffer === undefined || this.length != this.coordinates.length);
        if (this.dirty === true) {
            this.buffer = new Buffer(gl);
            var color_1 = this.color;
            var selectionColor_1 = this.selectionColor;
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            var normals_1 = [];
            var textureCoordinates_1 = [];
            var rectanglePositions = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], _this.position[2]); });
            var bbox_1 = this.getMinMax(rectanglePositions);
            var leftTriangle = new Triangle(rectanglePositions[0], rectanglePositions[2], rectanglePositions[3]);
            var rightTriangle = new Triangle(rectanglePositions[0], rectanglePositions[1], rectanglePositions[2]);
            var triangles = [leftTriangle, rightTriangle];
            triangles.forEach(function (triangle) {
                var trianglePositions = triangle.positions;
                var normal = triangle.getNormal();
                trianglePositions.forEach(function (position) {
                    position.forEach(function (value) { return positions_1.push(value); });
                    normal.forEach(function (value) { return normals_1.push(value); });
                    color_1.forEach(function (value) { return colors_1.push(value); });
                    selectionColor_1.forEach(function (value) { return selectionColors_1.push(value); });
                    var rangeX = bbox_1.maxx - bbox_1.minx;
                    var rangeY = bbox_1.maxy - bbox_1.miny;
                    textureCoordinates_1.push((position[0] - bbox_1.minx) / rangeX);
                    textureCoordinates_1.push((position[1] - bbox_1.miny) / rangeY);
                });
            });
            this.length = this.coordinates.length;
            var indices = new Uint16Array(positions_1.length / 3);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.normalVBO = new Float32Array(normals_1);
            this.buffer.textureVBO = new Float32Array(textureCoordinates_1);
            this.buffer.texture = this.texture;
            this.buffer.postionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
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
    return Screen;
}(Renderable));
export default Screen;
