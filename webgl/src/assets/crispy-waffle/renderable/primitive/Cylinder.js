import Buffer from '../../Buffer.js';
import Renderable from '../../abstract/Renderable.js';
import VerticesMatrix from '../../topology/VerticesMatrix.js';
import Indices from '../../topology/Indices.js';
import Revolutor from '../../functional/Revolutor.js';
import { mat4, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
export default class Cylinder extends Renderable {
    constructor(options) {
        super();
        this.init(options);
    }
    init(options) {
        this.triangles = [];
        this.radius = 1.0;
        this.height = 3.0;
        this.density = 36;
        this.name = "Untitled Cylinder";
        this.indicesCount = 0;
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
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
    }
    rotate(xValue, yValue, tm) {
        let pitchAxis = vec3.fromValues(1, 0, 0);
        let pitchMatrix = mat4.fromRotation(mat4.create(), yValue, pitchAxis);
        return mat4.multiply(tm, tm, pitchMatrix);
    }
    render(gl, shaderInfo, frameBufferObjs) {
        let objectRotationMatrix = this.getRotationMatrix();
        let objectPositionHighLow = this.getPositionHighLow();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix);
        gl.uniform3fv(shaderInfo.uniformLocations.objectPositionHigh, objectPositionHighLow[0]);
        gl.uniform3fv(shaderInfo.uniformLocations.objectPositionLow, objectPositionHighLow[1]);
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
            gl.drawElements(Renderable.globalOptions.drawElementsType, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    }
    // overriding
    getBuffer(gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            if (this.texture) {
                this.buffer.texture = this.texture;
            }
            this.indicesCount = 0;
            let color = this.color;
            let selectionColor = this.selectionColor;
            let colors = [];
            let selectionColors = [];
            let positions = [];
            let normals = [];
            let textureCoordinates = [];
            let topPositions = [];
            topPositions.push(vec3.fromValues(0, 0.0, this.height));
            topPositions.push(vec3.fromValues(this.radius / 2, 0.0, this.height));
            let outerPositions = [];
            outerPositions.push(vec3.fromValues(this.radius / 2, 0.0, this.height));
            outerPositions.push(vec3.fromValues(this.radius / 2, 0.0, 0));
            let bottomPositions = [];
            bottomPositions.push(vec3.fromValues(this.radius / 2, 0.0, 0));
            bottomPositions.push(vec3.fromValues(0, 0.0, 0.0));
            let indicesObject = new Indices();
            let topVerticesMatrix = Revolutor.revolute(topPositions, indicesObject, this.density);
            let outerVerticesMatrix = Revolutor.revolute(outerPositions, indicesObject, this.density);
            let bottomVerticesMatrix = Revolutor.revolute(bottomPositions, indicesObject, this.density);
            let indices = [];
            let topTriangles = Revolutor.convertTriangles(topVerticesMatrix);
            let outerTriangles = Revolutor.convertTriangles(outerVerticesMatrix);
            let bottomTriangles = Revolutor.convertTriangles(bottomVerticesMatrix);
            topTriangles = topTriangles.concat(outerTriangles);
            topTriangles = topTriangles.concat(bottomTriangles);
            topTriangles.forEach((triangle) => {
                let validation = triangle.validate();
                triangle.vertices.forEach(vertex => {
                    if (validation) {
                        indices.push(vertex.index);
                    }
                });
            });
            let verticesMatrix = new VerticesMatrix();
            verticesMatrix.concat(topVerticesMatrix);
            verticesMatrix.concat(outerVerticesMatrix);
            verticesMatrix.concat(bottomVerticesMatrix);
            verticesMatrix.forEach((vertices) => {
                vertices.forEach((vertex, index) => {
                    let position = vertex.position;
                    let normal = vertex.normal;
                    let color = vertex.color;
                    let textureCoordinate = vertex.textureCoordinate;
                    position.forEach((value) => positions.push(value));
                    normal.forEach((value) => normals.push(value));
                    this.color.forEach((value) => colors.push(value));
                    selectionColor.forEach((value) => selectionColors.push(value));
                    textureCoordinate.forEach((value) => textureCoordinates.push(value));
                });
            });
            this.buffer.indicesVBO = new Uint16Array(indices);
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
Cylinder.objectName = "Cylinder";
