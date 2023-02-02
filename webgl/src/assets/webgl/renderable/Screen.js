"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Buffer_js_1 = __importDefault(require("@/assets/webgl/Buffer.js"));
const Renderable_js_1 = __importDefault(require("@/assets/webgl/abstract/Renderable.js"));
const Triangle_js_1 = __importDefault(require("@/assets/webgl/geometry/Triangle.js"));
const gl_matrix_1 = require("gl-matrix"); // eslint-disable-line no-unused-vars
class Screen extends Renderable_js_1.default {
    constructor(coordinates, options) {
        super();
        this.forDebug = false;
        this.init(coordinates, options);
    }
    init(coordinates, options) {
        this.length = 0;
        this.name = "Untitled Screen";
        if (coordinates)
            this.coordinates = coordinates;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = gl_matrix_1.vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = gl_matrix_1.vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if (options === null || options === void 0 ? void 0 : options.forDebug)
            this.forDebug = options.forDebug;
        if (options === null || options === void 0 ? void 0 : options.textureLocation)
            this.textureLocation = options.textureLocation;
    }
    setGlTextureNumber(glTextureNumber) {
        this.glTextureNumber = glTextureNumber;
    }
    render(gl, shaderInfo, frameBufferObjs) {
        let buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
        buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.postionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
        gl.uniform1i(shaderInfo.uniformLocations.textureType, 0);
    }
    getBuffer(gl) {
        this.dirty = (this.buffer === undefined || this.length != this.coordinates.length);
        if (this.dirty === true) {
            this.buffer = new Buffer_js_1.default(gl);
            let color = this.color;
            let selectionColor = this.selectionColor;
            let colors = [];
            let selectionColors = [];
            let positions = [];
            let normals = [];
            let textureCoordinates = [];
            let rectanglePositions = this.coordinates.map((coordinate) => gl_matrix_1.vec3.fromValues(coordinate[0], coordinate[1], this.position[2]));
            let bbox = this.getMinMax(rectanglePositions);
            let leftTriangle = new Triangle_js_1.default(rectanglePositions[0], rectanglePositions[2], rectanglePositions[3]);
            let rightTriangle = new Triangle_js_1.default(rectanglePositions[0], rectanglePositions[1], rectanglePositions[2]);
            let triangles = [leftTriangle, rightTriangle];
            triangles.forEach((triangle) => {
                let trianglePositions = triangle.positions;
                let normal = triangle.getNormal();
                trianglePositions.forEach((position) => {
                    position.forEach((value) => positions.push(value));
                    normal.forEach((value) => normals.push(value));
                    color.forEach((value) => colors.push(value));
                    selectionColor.forEach((value) => selectionColors.push(value));
                    let rangeX = bbox.maxx - bbox.minx;
                    let rangeY = bbox.maxy - bbox.miny;
                    textureCoordinates.push((position[0] - bbox.minx) / rangeX);
                    textureCoordinates.push((position[1] - bbox.miny) / rangeY);
                });
            });
            this.length = this.coordinates.length;
            let indices = new Uint16Array(positions.length / 3);
            this.buffer.indicesVBO = indices.map((obj, index) => index);
            this.buffer.positionsVBO = new Float32Array(positions);
            this.buffer.colorVBO = new Float32Array(colors);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors);
            this.buffer.normalVBO = new Float32Array(normals);
            this.buffer.textureVBO = new Float32Array(textureCoordinates);
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
    }
}
exports.default = Screen;
