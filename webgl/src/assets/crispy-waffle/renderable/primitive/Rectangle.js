import Buffer from '../../Buffer.js';
import Renderable from '../../abstract/Renderable.js';
import Triangle from '../../geometry/Triangle.js';
import { vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
export default class Rectangle extends Renderable {
    constructor(coordinates, options) {
        super();
        this.init(coordinates, options);
    }
    init(coordinates, options) {
        this.length = 0;
        this.name = "Untitled Rectangle";
        if (options === null || options === void 0 ? void 0 : options.id) {
            this.id = options.id;
            this.selectionColor = this.convertIdToColor(options.id);
        }
        if (coordinates)
            this.coordinates = coordinates;
        if (options === null || options === void 0 ? void 0 : options.position)
            this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
        if (options === null || options === void 0 ? void 0 : options.color)
            this.color = vec4.set(this.color, options === null || options === void 0 ? void 0 : options.color.r, options === null || options === void 0 ? void 0 : options.color.g, options === null || options === void 0 ? void 0 : options.color.b, options === null || options === void 0 ? void 0 : options.color.a);
        if (options === null || options === void 0 ? void 0 : options.texture)
            this.texture = options.texture;
        if ((options === null || options === void 0 ? void 0 : options.image) && !(options === null || options === void 0 ? void 0 : options.texture))
            this.image = options.image;
    }
    render(gl, shaderInfo, frameBufferObjs) {
        let objectRotationMatrix = this.getRotationMatrix();
        let objectPositionHighLow = this.getPositionHighLow();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix);
        gl.uniform3fv(shaderInfo.uniformLocations.objectPositionHigh, objectPositionHighLow[0]);
        gl.uniform3fv(shaderInfo.uniformLocations.objectPositionLow, objectPositionHighLow[1]);
        let buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexNormal);
        buffer.bindBuffer(buffer.normalGlBuffer, 3, shaderInfo.attributeLocations.vertexNormal);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexColor);
        buffer.bindBuffer(buffer.colorGlBuffer, 4, shaderInfo.attributeLocations.vertexColor);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexSelectionColor);
        buffer.bindBuffer(buffer.selectionColorGlBuffer, 4, shaderInfo.attributeLocations.vertexSelectionColor);
        frameBufferObjs.forEach((frameBufferObj) => {
            frameBufferObj.bind(shaderInfo);
            const textureType = frameBufferObj.textureType;
            if (textureType == 1) {
                gl.bindTexture(gl.TEXTURE_2D, buffer.texture);
                gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
                buffer.bindBuffer(buffer.textureGlBuffer, 2, shaderInfo.attributeLocations.textureCoordinate);
            }
            gl.drawElements(Renderable.globalOptions.drawElementsType, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    }
    getBuffer(gl) {
        this.dirty = (this.buffer === undefined || this.length != this.coordinates.length);
        if (this.dirty === true) {
            this.buffer = new Buffer(gl);
            let color = this.color;
            let selectionColor = this.selectionColor;
            let colors = [];
            let selectionColors = [];
            let positions = [];
            let normals = [];
            let textureCoordinates = [];
            let rectanglePositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.position[2]));
            let bbox = this.getMinMax(rectanglePositions);
            let leftTriangle = new Triangle(rectanglePositions[0], rectanglePositions[1], rectanglePositions[2]);
            let rightTriangle = new Triangle(rectanglePositions[0], rectanglePositions[2], rectanglePositions[3]);
            let triangles = [leftTriangle, rightTriangle];
            triangles.forEach((triangle) => {
                let trianglePositions = triangle.positions;
                let normal = triangle.getNormal();
                trianglePositions.forEach((position) => {
                    position.forEach((value) => { positions.push(value); });
                    normal.forEach((value) => normals.push(value));
                    color.forEach((value) => colors.push(value));
                    selectionColor.forEach((value) => selectionColors.push(value));
                    let rangeX = bbox.maxx - bbox.minx;
                    let rangeY = bbox.maxy - bbox.miny;
                    textureCoordinates.push((position[0] - bbox.minx) / rangeX);
                    textureCoordinates.push((position[1] - bbox.miny) / rangeY);
                });
            });
            this.length = this.coordinates.length / 3;
            let indices = new Uint16Array(positions.length);
            this.buffer.indicesVBO = indices.map((obj, index) => index);
            this.buffer.positionsVBO = new Float32Array(positions);
            this.buffer.colorVBO = new Float32Array(colors);
            this.buffer.selectionColorVBO = new Float32Array(selectionColors);
            this.buffer.normalVBO = new Float32Array(normals);
            this.buffer.textureVBO = new Float32Array(textureCoordinates);
            if (this.texture) {
                this.buffer.texture = this.texture;
            }
            else if (this.image) {
                let texture = this.buffer.createTexture(this.image);
                this.buffer.texture = texture;
                this.texture = texture;
            }
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    }
}
Rectangle.objectName = "Rectangle";
