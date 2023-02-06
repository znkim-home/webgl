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
import { vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
var Obj = /** @class */ (function (_super) {
    __extends(Obj, _super);
    function Obj(options, objData) {
        var _this = _super.call(this) || this;
        _this.init(options, objData);
        return _this;
    }
    Obj.prototype.init = function (options, objData) {
        this.triangles = [];
        this.radius = 1.0;
        this.height = 3.0;
        this.scale = 1.0;
        this.name = "Untitled OBJ File";
        if (options === null || options === void 0 ? void 0 : options.radius)
            this.radius = options.radius;
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.rotation)
            this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
        if (options === null || options === void 0 ? void 0 : options.scale)
            this.scale = options.scale;
        this.objData = objData;
    };
    Obj.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
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
    Obj.prototype.getBuffer = function (gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            var color_1 = this.color;
            var selectionColor_1 = this.selectionColor;
            var colors_1 = [];
            var selectionColors_1 = [];
            var positions_1 = [];
            var normals_1 = [];
            var textureCoordinates = [];
            var coordinates_1 = [];
            var objData = this.objData;
            var scaler_1 = this.scale;
            var minX_1 = Number.MAX_SAFE_INTEGER;
            var minY_1 = Number.MAX_SAFE_INTEGER;
            var minZ_1 = Number.MAX_SAFE_INTEGER;
            var maxX_1 = Number.MIN_SAFE_INTEGER;
            var maxY_1 = Number.MIN_SAFE_INTEGER;
            var maxZ_1 = Number.MIN_SAFE_INTEGER;
            var triangles_1 = [];
            objData.vertices.forEach(function (vertice) {
                var xyz = vertice.split(" ").filter(function (block) { return block !== ''; });
                var x = parseFloat(xyz[0]) * scaler_1;
                var y = parseFloat(xyz[1]) * scaler_1;
                var z = parseFloat(xyz[2]) * scaler_1;
                coordinates_1.push(vec3.fromValues(x, z, y));
            });
            var allCoordinates_1 = [];
            objData.allVertices.forEach(function (vertice) {
                var xyz = vertice.split(" ").filter(function (block) { return block !== ''; });
                var x = parseFloat(xyz[0]) * scaler_1;
                var y = parseFloat(xyz[1]) * scaler_1;
                var z = parseFloat(xyz[2]) * scaler_1;
                if (minX_1 > x)
                    minX_1 = x;
                if (minY_1 > y)
                    minY_1 = y;
                if (minZ_1 > z)
                    minZ_1 = z;
                if (maxX_1 < x)
                    maxX_1 = x;
                if (maxY_1 < y)
                    maxY_1 = y;
                if (maxZ_1 < z)
                    maxZ_1 = z;
                allCoordinates_1.push(vec3.fromValues(x, z, y));
            });
            objData.faces.forEach(function (face) {
                var splitedFaces = face.split(" ").filter(function (block) { return block !== ''; });
                var length = splitedFaces.length;
                if (length >= 3) {
                    var face_1 = splitedFaces.map(function (theIndex) {
                        return parseInt(theIndex.split("/")[0]);
                    });
                    var theCoordinates = face_1.map(function (theIndex) {
                        if (theIndex < 0) {
                            return coordinates_1[coordinates_1.length + theIndex];
                        }
                        else {
                            return allCoordinates_1[theIndex - 1];
                        }
                    });
                    for (var loop = 2; loop < length; loop++) {
                        triangles_1.push(new Triangle(theCoordinates[0], theCoordinates[loop], theCoordinates[loop - 1]));
                        color_1.forEach(function (value) { return colors_1.push(value); });
                        color_1.forEach(function (value) { return colors_1.push(value); });
                        color_1.forEach(function (value) { return colors_1.push(value); });
                    }
                }
            });
            triangles_1.forEach(function (triangle) {
                var trianglePositions = triangle.positions;
                var normal = triangle.getNormal();
                trianglePositions.forEach(function (position) {
                    position.forEach(function (value) { return positions_1.push(value); });
                    normal.forEach(function (value) { return normals_1.push(value); });
                    selectionColor_1.forEach(function (value) { return selectionColors_1.push(value); });
                });
            });
            var indices = new Uint16Array(positions_1.length);
            this.buffer.indicesVBO = indices.map(function (obj, index) { return index; });
            this.buffer.positionsVBO = new Float32Array(positions_1);
            this.buffer.normalVBO = new Float32Array(normals_1);
            this.buffer.colorVBO = new Float32Array(colors_1);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors_1);
            this.buffer.textureVBO = new Float32Array(textureCoordinates);
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
    return Obj;
}(Renderable));
export default Obj;
