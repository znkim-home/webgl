"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Buffer_js_1 = __importDefault(require("@/assets/webgl/Buffer.js"));
const Renderable_js_1 = __importDefault(require("@/assets/webgl/abstract/Renderable.js"));
const Triangle_1 = __importDefault(require("@/assets/webgl/geometry/Triangle"));
const gl_matrix_1 = require("gl-matrix"); // eslint-disable-line no-unused-vars
class Obj extends Renderable_js_1.default {
    constructor(options, objData) {
        super();
        this.init(options, objData);
    }
    init(options, objData) {
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
            this.position = gl_matrix_1.vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.rotation)
            this.rotation = gl_matrix_1.vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = gl_matrix_1.vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
        if (options === null || options === void 0 ? void 0 : options.scale)
            this.scale = options.scale;
        this.objData = objData;
    }
    render(gl, shaderInfo, frameBufferObjs) {
        let tm = this.getTransformMatrix();
        let rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        let buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
        buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
        buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        frameBufferObjs.forEach((frameBufferObj) => {
            frameBufferObj.bind();
            if (this.image || this.texture) {
                gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
                buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
            }
            gl.drawElements(gl.TRIANGLES, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    }
    // overriding
    getBuffer(gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer_js_1.default(gl);
            let color = this.color;
            let selectionColor = this.selectionColor;
            let colors = [];
            let selectionColors = [];
            let positions = [];
            let normals = [];
            let textureCoordinates = [];
            let coordinates = [];
            let objData = this.objData;
            let scaler = this.scale;
            let minX = Number.MAX_SAFE_INTEGER;
            let minY = Number.MAX_SAFE_INTEGER;
            let minZ = Number.MAX_SAFE_INTEGER;
            let maxX = Number.MIN_SAFE_INTEGER;
            let maxY = Number.MIN_SAFE_INTEGER;
            let maxZ = Number.MIN_SAFE_INTEGER;
            let triangles = [];
            objData.vertices.forEach((vertice) => {
                let xyz = vertice.split(" ").filter(block => block !== '');
                let x = parseFloat(xyz[0]) * scaler;
                let y = parseFloat(xyz[1]) * scaler;
                let z = parseFloat(xyz[2]) * scaler;
                coordinates.push(gl_matrix_1.vec3.fromValues(x, z, y));
            });
            let allCoordinates = [];
            objData.allVertices.forEach((vertice) => {
                let xyz = vertice.split(" ").filter(block => block !== '');
                let x = parseFloat(xyz[0]) * scaler;
                let y = parseFloat(xyz[1]) * scaler;
                let z = parseFloat(xyz[2]) * scaler;
                if (minX > x)
                    minX = x;
                if (minY > y)
                    minY = y;
                if (minZ > z)
                    minZ = z;
                if (maxX < x)
                    maxX = x;
                if (maxY < y)
                    maxY = y;
                if (maxZ < z)
                    maxZ = z;
                allCoordinates.push(gl_matrix_1.vec3.fromValues(x, z, y));
            });
            objData.faces.forEach((face) => {
                let splitedFaces = face.split(" ").filter(block => block !== '');
                let length = splitedFaces.length;
                if (length >= 3) {
                    let face = splitedFaces.map((theIndex) => {
                        return parseInt(theIndex.split("/")[0]);
                    });
                    let theCoordinates = face.map((theIndex) => {
                        if (theIndex < 0) {
                            return coordinates[coordinates.length + theIndex];
                        }
                        else {
                            return allCoordinates[theIndex - 1];
                        }
                    });
                    for (let loop = 2; loop < length; loop++) {
                        triangles.push(new Triangle_1.default(theCoordinates[0], theCoordinates[loop], theCoordinates[loop - 1]));
                        color.forEach((value) => colors.push(value));
                        color.forEach((value) => colors.push(value));
                        color.forEach((value) => colors.push(value));
                    }
                }
            });
            triangles.forEach((triangle) => {
                let trianglePositions = triangle.positions;
                let normal = triangle.getNormal();
                trianglePositions.forEach((position) => {
                    position.forEach((value) => positions.push(value));
                    normal.forEach((value) => normals.push(value));
                    selectionColor.forEach((value) => selectionColors.push(value));
                });
            });
            let indices = new Uint16Array(positions.length);
            this.buffer.indicesVBO = indices.map((obj, index) => index);
            this.buffer.positionsVBO = new Float32Array(positions);
            this.buffer.normalVBO = new Float32Array(normals);
            this.buffer.colorVBO = new Float32Array(colors);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors);
            this.buffer.textureVBO = new Float32Array(textureCoordinates);
            if (this.image) {
                let texture = this.buffer.createTexture(this.image);
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
    }
}
exports.default = Obj;
