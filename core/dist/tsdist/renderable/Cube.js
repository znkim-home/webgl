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
import TextureCoordinator from '../functional/TextureCoodinator';
import { vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
var Cube = /** @class */ (function (_super) {
    __extends(Cube, _super);
    function Cube(options) {
        var _this = _super.call(this) || this;
        _this.init(options);
        return _this;
    }
    Cube.prototype.init = function (options) {
        this.texturePosition = vec2.fromValues(0, 0);
        this.size = vec3.fromValues(128, 128, 128); // size : width, length, height
        this.name = "Untitled Cube";
        if (options === null || options === void 0 ? void 0 : options.name)
            this.name = options.name;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.size)
            this.size = vec3.set(this.size, options.size.width, options.size.length, options.size.height);
        if (options === null || options === void 0 ? void 0 : options.rotation)
            this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if (options === null || options === void 0 ? void 0 : options.texturePosition)
            this.texturePosition = options.texturePosition;
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
    };
    // overriding
    Cube.prototype.render = function (gl, shaderInfo, frameBufferObjs) {
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
            frameBufferObj.bind(shaderInfo);
            var textureType = frameBufferObj.textureType;
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
    Cube.prototype.getBuffer = function (gl) {
        if (this.buffer === undefined) {
            this.buffer = new Buffer(gl);
            if (this.texture) {
                this.buffer.texture = this.texture;
                this.textureSize = vec2.fromValues(512, 512);
            }
            var w = this.size[0] / 2;
            var l = this.size[1] / 2;
            var h = this.size[2];
            var color = this.color;
            var p0 = vec3.fromValues(-w, -l, 0);
            var p1 = vec3.fromValues(w, -l, 0);
            var p2 = vec3.fromValues(w, l, 0);
            var p3 = vec3.fromValues(-w, l, 0);
            var p4 = vec3.fromValues(-w, -l, h);
            var p5 = vec3.fromValues(w, -l, h);
            var p6 = vec3.fromValues(w, l, h);
            var p7 = vec3.fromValues(-w, l, h);
            var n0 = this.normal(p0, p2, p1);
            var n1 = this.normal(p0, p3, p2);
            var n2 = this.normal(p4, p5, p6);
            var n3 = this.normal(p4, p6, p7);
            var n4 = this.normal(p3, p0, p4);
            var n5 = this.normal(p3, p4, p7);
            var n6 = this.normal(p1, p2, p6);
            var n7 = this.normal(p1, p6, p5);
            var n8 = this.normal(p0, p1, p5);
            var n9 = this.normal(p0, p5, p4);
            var n10 = this.normal(p2, p3, p7);
            var n11 = this.normal(p2, p7, p6);
            var selectionColor = this.selectionColor;
            this.buffer.positionsVBO = new Float32Array([
                p0[0], p0[1], p0[2],
                p2[0], p2[1], p2[2],
                p1[0], p1[1], p1[2],
                p0[0], p0[1], p0[2],
                p3[0], p3[1], p3[2],
                p2[0], p2[1], p2[2],
                p4[0], p4[1], p4[2],
                p5[0], p5[1], p5[2],
                p6[0], p6[1], p6[2],
                p4[0], p4[1], p4[2],
                p6[0], p6[1], p6[2],
                p7[0], p7[1], p7[2],
                p3[0], p3[1], p3[2],
                p0[0], p0[1], p0[2],
                p4[0], p4[1], p4[2],
                p3[0], p3[1], p3[2],
                p4[0], p4[1], p4[2],
                p7[0], p7[1], p7[2],
                p1[0], p1[1], p1[2],
                p2[0], p2[1], p2[2],
                p6[0], p6[1], p6[2],
                p1[0], p1[1], p1[2],
                p6[0], p6[1], p6[2],
                p5[0], p5[1], p5[2],
                p0[0], p0[1], p0[2],
                p1[0], p1[1], p1[2],
                p5[0], p5[1], p5[2],
                p0[0], p0[1], p0[2],
                p5[0], p5[1], p5[2],
                p4[0], p4[1], p4[2],
                p2[0], p2[1], p2[2],
                p3[0], p3[1], p3[2],
                p7[0], p7[1], p7[2],
                p2[0], p2[1], p2[2],
                p7[0], p7[1], p7[2],
                p6[0], p6[1], p6[2],
            ]);
            this.buffer.normalVBO = new Float32Array([
                n0[0], n0[1], n0[2],
                n0[0], n0[1], n0[2],
                n0[0], n0[1], n0[2],
                n1[0], n1[1], n1[2],
                n1[0], n1[1], n1[2],
                n1[0], n1[1], n1[2],
                n2[0], n2[1], n2[2],
                n2[0], n2[1], n2[2],
                n2[0], n2[1], n2[2],
                n3[0], n3[1], n3[2],
                n3[0], n3[1], n3[2],
                n3[0], n3[1], n3[2],
                n4[0], n4[1], n4[2],
                n4[0], n4[1], n4[2],
                n4[0], n4[1], n4[2],
                n5[0], n5[1], n5[2],
                n5[0], n5[1], n5[2],
                n5[0], n5[1], n5[2],
                n6[0], n6[1], n6[2],
                n6[0], n6[1], n6[2],
                n6[0], n6[1], n6[2],
                n7[0], n7[1], n7[2],
                n7[0], n7[1], n7[2],
                n7[0], n7[1], n7[2],
                n8[0], n8[1], n8[2],
                n8[0], n8[1], n8[2],
                n8[0], n8[1], n8[2],
                n9[0], n9[1], n9[2],
                n9[0], n9[1], n9[2],
                n9[0], n9[1], n9[2],
                n10[0], n10[1], n10[2],
                n10[0], n10[1], n10[2],
                n10[0], n10[1], n10[2],
                n11[0], n11[1], n11[2],
                n11[0], n11[1], n11[2],
                n11[0], n11[1], n11[2],
            ]);
            this.buffer.colorVBO = new Float32Array([
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
                color[0], color[1], color[2], color[3],
            ]);
            this.buffer.selectionColorVBO = new Float32Array([
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
                selectionColor[0], selectionColor[1], selectionColor[2], selectionColor[3],
            ]);
            var textureCoordinate_1 = TextureCoordinator.calcTextureCoordinate(this.textureSize, this.texturePosition, 16);
            var textureCoordinates_1 = [];
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            var positionCount = this.buffer.positionsVBO.length / 3;
            var indices = new Uint16Array(positionCount);
            this.buffer.indicesVBO = indices.map(function (obj, index) {
                textureCoordinates_1.push(textureCoordinate_1[0]);
                textureCoordinates_1.push(textureCoordinate_1[1]);
                textureCoordinates_1.push(textureCoordinate_1[2]);
                textureCoordinates_1.push(textureCoordinate_1[1]);
                textureCoordinates_1.push(textureCoordinate_1[2]);
                textureCoordinates_1.push(textureCoordinate_1[3]);
                textureCoordinates_1.push(textureCoordinate_1[0]);
                textureCoordinates_1.push(textureCoordinate_1[1]);
                textureCoordinates_1.push(textureCoordinate_1[2]);
                textureCoordinates_1.push(textureCoordinate_1[3]);
                textureCoordinates_1.push(textureCoordinate_1[0]);
                textureCoordinates_1.push(textureCoordinate_1[3]);
                return index;
            });
            this.buffer.textureVBO = new Float32Array(textureCoordinates_1);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
        }
        return this.buffer;
    };
    return Cube;
}(Renderable));
export default Cube;
