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
import Triangle from '@/geometry/Triangle';
import Tessellator from '@/functional/Tessellator.js';
import { vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
var Polygon = /** @class */ (function (_super) {
    __extends(Polygon, _super);
    function Polygon(coordinates, options) {
        var _this = _super.call(this) || this;
        _this.init(coordinates, options);
        return _this;
    }
    Polygon.prototype.init = function (coordinates, options) {
        this.triangles = [];
        this.height = 3.0;
        this.name = "Untitled Polygon";
        if (coordinates)
            this.coordinates = coordinates;
        if (options === null || options === void 0 ? void 0 : options.name)
            this.name = options.name;
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.rotation)
            this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
    };
    Polygon.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var tm = this.getTransformMatrix();
        var rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
        buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
        buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        frameBufferObjs.forEach(function (frameBufferObj) {
            var textureType = frameBufferObj.textureType;
            frameBufferObj.bind(shaderInfo);
            if (textureType == 1) {
                gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
                buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
            }
            gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    };
    // overriding
    Polygon.prototype.getBuffer = function (gl) {
        var _this = this;
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var color_1 = this.color;
            var selectionColor_1 = this.selectionColor;
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            var normals_1 = [];
            var textureCoordinates_1 = [];
            var topPositions = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], _this.height); });
            var bottomPositions = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], 0); });
            var bbox_1 = this.getMinMax(topPositions);
            bbox_1.minz = 0;
            bbox_1.maxz = this.height;
            if (Tessellator.validateCCW(topPositions) < 0) {
                topPositions.reverse();
                bottomPositions.reverse();
            }
            var topTriangles = Tessellator.tessellate(topPositions);
            var bottomTriangles = Tessellator.tessellate(bottomPositions, false);
            var sideTriangles = this.createSideTriangle(topPositions, bottomPositions, true);
            var triangles = [];
            triangles = triangles.concat(topTriangles);
            triangles = triangles.concat(bottomTriangles);
            triangles = triangles.concat(sideTriangles);
            this.triangles = triangles;
            triangles.forEach(function (triangle) {
                var trianglePositions = triangle.positions;
                var normal = triangle.getNormal();
                trianglePositions.forEach(function (position) {
                    position.forEach(function (value) { return positions_1.push(value); });
                    normal.forEach(function (value) { return normals_1.push(value); });
                    color_1.forEach(function (value) { return colors_1.push(value); });
                    selectionColor_1.forEach(function (value) { return selectionColors_1.push(value); });
                    var xoffset = bbox_1.maxx - bbox_1.minx;
                    var yoffset = bbox_1.maxy - bbox_1.miny;
                    var zoffset = bbox_1.maxz - bbox_1.minz;
                    if (normal[0] == 1 || normal[0] == -1) {
                        textureCoordinates_1.push((position[1] - bbox_1.miny) / yoffset);
                        textureCoordinates_1.push((position[2] - bbox_1.minz) / zoffset);
                    }
                    else if (normal[1] == 1 || normal[1] == -1) {
                        textureCoordinates_1.push((position[0] - bbox_1.minx) / xoffset);
                        textureCoordinates_1.push((position[2] - bbox_1.minz) / zoffset);
                    }
                    else if (normal[2] == 1 || normal[2] == -1) {
                        textureCoordinates_1.push((position[0] - bbox_1.minx) / xoffset);
                        textureCoordinates_1.push((position[1] - bbox_1.miny) / yoffset);
                    }
                });
            });
            var indices = new Uint16Array(positions_1.length / 3);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.normalVBO = new Float32Array(normals_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.textureVBO = new Float32Array(textureCoordinates_1);
            if (this.texture) {
                this.buffer.texture = this.texture;
            }
            else if (this.image) {
                this.buffer.texture = this.buffer.createTexture(this.image);
            }
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
    Polygon.prototype.createSideTriangle = function (topPositions, bottomPositions, isCCW) {
        if (isCCW === void 0) { isCCW = true; }
        var triangles = [];
        if (topPositions.length != bottomPositions.length) {
            throw new Error("plane length is not matched.");
        }
        var length = topPositions.length;
        for (var i = 0; i < length; i++) {
            var topA = topPositions.getPrev(i);
            var topB = topPositions.get(i);
            var bottomA = bottomPositions.getPrev(i);
            var bottomB = bottomPositions.get(i);
            if (isCCW) {
                triangles.push(new Triangle(topB, topA, bottomA));
                triangles.push(new Triangle(topB, bottomA, bottomB));
            }
            else {
                triangles.push(new Triangle(topB, bottomA, topA));
                triangles.push(new Triangle(topB, bottomB, bottomA));
            }
        }
        return triangles;
    };
    Polygon.prototype.createRandomColor = function () {
        var r = Math.round(Math.random() * 10) / 10;
        var g = Math.round(Math.random() * 10) / 10;
        var b = Math.round(Math.random() * 10) / 10;
        return vec4.fromValues(r, g, b, 1.0);
    };
    return Polygon;
}(Renderable));
export default Polygon;
