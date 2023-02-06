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
import Triangle from '../geometry/Triangle.js';
import Tessellator from '../functional/Tessellator.js';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
var Cylinder = /** @class */ (function (_super) {
    __extends(Cylinder, _super);
    function Cylinder(options) {
        var _this = _super.call(this) || this;
        _this.init(options);
        return _this;
    }
    Cylinder.prototype.init = function (options) {
        this.triangles = [];
        this.radius = 1.0;
        this.height = 3.0;
        this.density = 36;
        this.name = "Untitled Cylinder";
        if (options === null || options === void 0 ? void 0 : options.radius)
            this.radius = options.radius;
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.density)
            this.density = options.density;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.rotation)
            this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
    };
    Cylinder.prototype.rotate = function (xValue, yValue, tm) {
        var pitchAxis = vec3.fromValues(1, 0, 0);
        var pitchMatrix = mat4.fromRotation(mat4.create(), yValue, pitchAxis);
        return mat4.multiply(tm, tm, pitchMatrix);
    };
    Cylinder.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
        var _this = this;
        var tm = this.getTransformMatrix();
        var rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        var buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
        buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
        buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        frameBufferObjs.forEach(function (frameBufferObj) {
            frameBufferObj.bind();
            if (_this.image || _this.texture) {
                gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
                buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
            }
            gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    };
    // overriding
    Cylinder.prototype.getBuffer = function (gl) {
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
            this.coordinates = [];
            var angleOffset = (360 / this.density);
            var origin_1 = vec2.fromValues(0.0, 0.0);
            var rotateVec2 = vec2.fromValues(0.0, 0.0 + this.radius);
            for (var i = 0; i < this.density; i++) {
                var angle = Math.radian(i * angleOffset);
                var rotated = vec2.rotate(vec2.create(), rotateVec2, origin_1, angle);
                this.coordinates.push(rotated);
            }
            var topPositions_1 = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], _this.height); });
            var bottomPositions_1 = this.coordinates.map(function (coordinate) { return vec3.fromValues(coordinate[0], coordinate[1], 0.0); });
            var bbox_1 = this.getMinMax(topPositions_1);
            bbox_1.minz = this.position[2];
            bbox_1.maxz = this.position[2] + this.height;
            if (Tessellator.validateCCW(topPositions_1) < 0) {
                topPositions_1.reverse();
                bottomPositions_1.reverse();
            }
            var topOrigin_1 = vec3.fromValues(0.0, 0.0, this.height);
            var topTriangles = topPositions_1.map(function (topPosition, index) {
                var nextPosition = topPositions_1.getNext(index);
                return new Triangle(topOrigin_1, topPosition, nextPosition);
            });
            var bottomOrigin_1 = vec3.fromValues(0.0, 0.0, 0.0);
            var bottomTriangles = bottomPositions_1.map(function (bottomPosition, index) {
                var nextPosition = bottomPositions_1.getNext(index);
                return new Triangle(bottomOrigin_1, nextPosition, bottomPosition);
            });
            var sideTriangles = this.createSideTriangle(topPositions_1, bottomPositions_1, true);
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
            var indices = new Uint16Array(positions_1.length);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.normalVBO = new Float32Array(normals_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.textureVBO = new Float32Array(textureCoordinates_1);
            if (this.image) {
                var texture = this.buffer.createTexture(this.image);
                this.buffer.texture = texture;
                this.texture = texture;
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
    Cylinder.prototype.createSideTriangle = function (topPositions, bottomPositions, isCCW) {
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
    Cylinder.prototype.createRandomColor = function () {
        var r = Math.round(Math.random() * 10) / 10;
        var g = Math.round(Math.random() * 10) / 10;
        var b = Math.round(Math.random() * 10) / 10;
        return vec4.fromValues(r, g, b, 1.0);
    };
    return Cylinder;
}(Renderable));
export default Cylinder;
