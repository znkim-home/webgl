import Buffer from '../../Buffer.js';
import Renderable from '../../abstract/Renderable.js';
import { vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
export default class Point extends Renderable {
    constructor(options) {
        super();
        this.init(options);
    }
    init(options) {
        this.name = "Untitled Point";
        if (options === null || options === void 0 ? void 0 : options.height)
            this.height = options.height;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
    }
    render(gl, shaderInfo, frameBufferObjs) {
        let objectRotationMatrix = this.getRotationMatrix();
        let objectPositionHighLow = this.getPositionHighLow();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix);
        gl.uniform3fv(shaderInfo.uniformLocations.objectPositionHigh, objectPositionHighLow[0]);
        gl.uniform3fv(shaderInfo.uniformLocations.objectPositionLow, objectPositionHighLow[1]);
        let buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        frameBufferObjs.forEach((frameBufferObj) => {
            const textureType = frameBufferObj.textureType;
            frameBufferObj.bind();
            if (textureType == 4) {
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
                buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
            }
            else {
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
                buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
            }
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
            buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
            gl.disable(gl.DEPTH_TEST);
            gl.drawElements(gl.POINTS, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            gl.enable(gl.DEPTH_TEST);
            frameBufferObj.unbind();
        });
    }
    getBuffer(gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            let colors = [];
            let selectionColors = [];
            let positions = [];
            this.position.forEach((value) => positions.push(value));
            this.color.forEach((value) => colors.push(value));
            this.selectionColor.forEach((value) => selectionColors.push(value));
            let indices = new Uint16Array(positions.length);
            this.buffer.indicesVBO = indices.map((obj, index) => index);
            this.buffer.positionsVBO = new Float32Array(positions);
            this.buffer.colorVBO = new Float32Array(colors);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors);
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    }
}
Point.objectName = "Point";
