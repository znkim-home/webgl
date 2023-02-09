import Buffer from '../../Buffer.js';
import Renderable from '../../abstract/Renderable.js';
import Triangle from '../../geometry/Triangle.js';
import Tessellator from '../../functional/Tessellator.js';
import { mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
export default class Tube extends Renderable {
    constructor(options) {
        super();
        this.init(options);
    }
    init(options) {
        this.triangles = [];
        this.radius = 1.0;
        this.innerRadius = 0.5;
        if (options === null || options === void 0 ? void 0 : options.innerRadius)
            this.innerRadius = options.innerRadius;
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
            this.buffer = new Buffer(gl);
            if (this.texture) {
                this.buffer.texture = this.texture;
            }
            let color = this.color;
            let selectionColor = this.selectionColor;
            let colors = [];
            let selectionColors = [];
            let positions = [];
            let normals = [];
            let textureCoordinates = [];
            let innerCoordinates = [];
            let outerCoordinates = [];
            let angleOffset = (360 / this.density);
            let origin = vec2.fromValues(0.0, 0.0);
            let innerRotateVec2 = vec2.fromValues(0.0, 0.0 + this.innerRadius);
            let outerRotateVec2 = vec2.fromValues(0.0, 0.0 + this.radius);
            for (let i = 0; i < this.density; i++) {
                let angle = Math.radian(i * angleOffset);
                let innerRotated = vec2.rotate(vec2.create(), innerRotateVec2, origin, angle);
                let outerRotated = vec2.rotate(vec2.create(), outerRotateVec2, origin, angle);
                innerCoordinates.push(innerRotated);
                outerCoordinates.push(outerRotated);
            }
            let topInnerPositions = innerCoordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.height));
            let topOuterPositions = outerCoordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], this.height));
            let bottomInnerPositions = innerCoordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], 0.0));
            let bottomOuterPositions = outerCoordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], 0.0));
            let bbox = this.getMinMax(topOuterPositions);
            bbox.minz = this.position[2];
            bbox.maxz = this.position[2] + this.height;
            if (Tessellator.validateCCW(topOuterPositions) < 0) {
                topInnerPositions.reverse();
                topOuterPositions.reverse();
                bottomInnerPositions.reverse();
                bottomOuterPositions.reverse();
            }
            let topTriangles = [];
            topOuterPositions.forEach((topOuterPosition, index) => {
                let innerPosition = topInnerPositions.get(index);
                let nextInnerPosition = topInnerPositions.getNext(index);
                let nextOuterPosition = topOuterPositions.getNext(index);
                topTriangles.push(new Triangle(innerPosition, topOuterPosition, nextOuterPosition));
                topTriangles.push(new Triangle(innerPosition, nextOuterPosition, nextInnerPosition));
            });
            let bottomTriangles = [];
            bottomOuterPositions.forEach((bottomOuterPosition, index) => {
                let innerPosition = bottomInnerPositions.get(index);
                let nextInnerPosition = bottomInnerPositions.getNext(index);
                let nextOuterPosition = bottomOuterPositions.getNext(index);
                bottomTriangles.push(new Triangle(innerPosition, nextOuterPosition, bottomOuterPosition));
                bottomTriangles.push(new Triangle(innerPosition, nextInnerPosition, nextOuterPosition));
            });
            let sideInnerTriangles = this.createSideTriangle(topOuterPositions, bottomOuterPositions, true);
            let sideOuterTriangles = this.createSideTriangle(topInnerPositions, bottomInnerPositions, false);
            let triangles = [];
            triangles = triangles.concat(topTriangles);
            triangles = triangles.concat(bottomTriangles);
            triangles = triangles.concat(sideOuterTriangles);
            triangles = triangles.concat(sideInnerTriangles);
            this.triangles = triangles;
            triangles.forEach((triangle) => {
                let trianglePositions = triangle.positions;
                let normal = triangle.getNormal();
                trianglePositions.forEach((position) => {
                    position.forEach((value) => positions.push(value));
                    normal.forEach((value) => normals.push(value));
                    color.forEach((value) => colors.push(value));
                    selectionColor.forEach((value) => selectionColors.push(value));
                    let xoffset = bbox.maxx - bbox.minx;
                    let yoffset = bbox.maxy - bbox.miny;
                    let zoffset = bbox.maxz - bbox.minz;
                    if (normal[0] == 1 || normal[0] == -1) {
                        textureCoordinates.push((position[1] - bbox.miny) / yoffset);
                        textureCoordinates.push((position[2] - bbox.minz) / zoffset);
                    }
                    else if (normal[1] == 1 || normal[1] == -1) {
                        textureCoordinates.push((position[0] - bbox.minx) / xoffset);
                        textureCoordinates.push((position[2] - bbox.minz) / zoffset);
                    }
                    else if (normal[2] == 1 || normal[2] == -1) {
                        textureCoordinates.push((position[0] - bbox.minx) / xoffset);
                        textureCoordinates.push((position[1] - bbox.miny) / yoffset);
                    }
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
    createSideTriangle(topPositions, bottomPositions, isCCW = true) {
        let triangles = [];
        if (topPositions.length != bottomPositions.length) {
            throw new Error("plane length is not matched.");
        }
        let length = topPositions.length;
        for (let i = 0; i < length; i++) {
            let topA = topPositions.getPrev(i);
            let topB = topPositions.get(i);
            let bottomA = bottomPositions.getPrev(i);
            let bottomB = bottomPositions.get(i);
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
    }
    createRandomColor() {
        let r = Math.round(Math.random() * 10) / 10;
        let g = Math.round(Math.random() * 10) / 10;
        let b = Math.round(Math.random() * 10) / 10;
        return vec4.fromValues(r, g, b, 1.0);
    }
}
