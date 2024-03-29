import Buffer from '../Buffer.js';
import Renderable from '../abstract/Renderable.js';
import { vec3, vec4 } from 'gl-matrix';
export default class SkyBox extends Renderable {
    constructor(options) {
        super();
        this.init(options);
    }
    init(options) {
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
        if (options === null || options === void 0 ? void 0 : options.image)
            this.image = options.image;
        if (options === null || options === void 0 ? void 0 : options.images)
            this.images = options.images;
    }
    // overriding
    render(gl, shaderInfo, frameBufferObjs) {
        let tm = this.getTransformMatrix();
        let rm = this.getRotationMatrix();
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
        gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
        let buffer = this.getBuffer(gl);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesGlBuffer);
        gl.enableVertexAttribArray(shaderInfo.attributeLocations.vertexPosition);
        buffer.bindBuffer(buffer.positionsGlBuffer, 3, shaderInfo.attributeLocations.vertexPosition);
        frameBufferObjs.forEach((frameBufferObj) => {
            frameBufferObj.bind();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, buffer.texture);
            gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoordinate);
            buffer.bindBuffer(buffer.textureGlBuffer, 3, shaderInfo.attributeLocations.textureCoordinate);
            gl.drawElements(Renderable.globalOptions.drawElementsType, buffer.indicesLength, gl.UNSIGNED_SHORT, 0);
            frameBufferObj.unbind();
        });
    }
    // overriding
    getBuffer(gl) {
        if (this.buffer === undefined || this.dirty === true) {
            this.buffer = new Buffer(gl);
            let w = this.size[0] / 2;
            let l = this.size[1] / 2;
            let h = this.size[2];
            let color = this.color;
            let p0 = vec3.fromValues(-w, -l, 0);
            let p1 = vec3.fromValues(w, -l, 0);
            let p2 = vec3.fromValues(w, l, 0);
            let p3 = vec3.fromValues(-w, l, 0);
            let p4 = vec3.fromValues(-w, -l, h);
            let p5 = vec3.fromValues(w, -l, h);
            let p6 = vec3.fromValues(w, l, h);
            let p7 = vec3.fromValues(-w, l, h);
            let n0 = this.normal(p0, p1, p2);
            let n1 = this.normal(p0, p1, p3);
            let n2 = this.normal(p4, p6, p5);
            let n3 = this.normal(p4, p7, p6);
            let n4 = this.normal(p3, p4, p0);
            let n5 = this.normal(p3, p7, p4);
            let n6 = this.normal(p1, p6, p2);
            let n7 = this.normal(p1, p5, p6);
            let n8 = this.normal(p0, p5, p1);
            let n9 = this.normal(p0, p4, p5);
            let n10 = this.normal(p2, p7, p3);
            let n11 = this.normal(p2, p6, p7);
            let t4 = vec3.fromValues(-1, -1, -1);
            let t5 = vec3.fromValues(1, -1, -1);
            let t6 = vec3.fromValues(1, 1, -1);
            let t7 = vec3.fromValues(-1, 1, -1);
            let t0 = vec3.fromValues(-1, -1, 1);
            let t1 = vec3.fromValues(1, -1, 1);
            let t2 = vec3.fromValues(1, 1, 1);
            let t3 = vec3.fromValues(-1, 1, 1);
            let selectionColor = this.selectionColor;
            this.buffer.positionsVBO = new Float32Array([
                p0[0], p0[1], p0[2],
                p1[0], p1[1], p1[2],
                p2[0], p2[1], p2[2],
                p0[0], p0[1], p0[2],
                p2[0], p2[1], p2[2],
                p3[0], p3[1], p3[2],
                p4[0], p4[1], p4[2],
                p6[0], p6[1], p6[2],
                p5[0], p5[1], p5[2],
                p4[0], p4[1], p4[2],
                p7[0], p7[1], p7[2],
                p6[0], p6[1], p6[2],
                p3[0], p3[1], p3[2],
                p4[0], p4[1], p4[2],
                p0[0], p0[1], p0[2],
                p3[0], p3[1], p3[2],
                p7[0], p7[1], p7[2],
                p4[0], p4[1], p4[2],
                p1[0], p1[1], p1[2],
                p6[0], p6[1], p6[2],
                p2[0], p2[1], p2[2],
                p1[0], p1[1], p1[2],
                p5[0], p5[1], p5[2],
                p6[0], p6[1], p6[2],
                p0[0], p0[1], p0[2],
                p5[0], p5[1], p5[2],
                p1[0], p1[1], p1[2],
                p0[0], p0[1], p0[2],
                p4[0], p4[1], p4[2],
                p5[0], p5[1], p5[2],
                p2[0], p2[1], p2[2],
                p7[0], p7[1], p7[2],
                p3[0], p3[1], p3[2],
                p2[0], p2[1], p2[2],
                p6[0], p6[1], p6[2],
                p7[0], p7[1], p7[2],
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
            this.buffer.textureVBO = new Float32Array([
                t0[0], t0[1], t0[2],
                t1[0], t1[1], t1[2],
                t2[0], t2[1], t2[2],
                t0[0], t0[1], t0[2],
                t2[0], t2[1], t2[2],
                t3[0], t3[1], t3[2],
                -t4[0], -t4[1], t4[2],
                -t6[0], -t6[1], t6[2],
                -t5[0], -t5[1], t5[2],
                -t4[0], -t4[1], t4[2],
                -t7[0], -t7[1], t7[2],
                -t6[0], -t6[1], t6[2],
                t3[0], -t3[2], t3[1],
                t4[0], -t4[2], t4[1],
                t0[0], -t0[2], t0[1],
                t3[0], -t3[2], t3[1],
                t7[0], -t7[2], t7[1],
                t4[0], -t4[2], t4[1],
                t1[0], -t1[2], t1[1],
                t6[0], -t6[2], t6[1],
                t2[0], -t2[2], t2[1],
                t1[0], -t1[2], t1[1],
                t5[0], -t5[2], t5[1],
                t6[0], -t6[2], t6[1],
                -t0[0], t0[1], -t0[2],
                -t5[0], t5[1], -t5[2],
                -t1[0], t1[1], -t1[2],
                -t0[0], t0[1], -t0[2],
                -t4[0], t4[1], -t4[2],
                -t5[0], t5[1], -t5[2],
                t2[0], t2[1], t2[2],
                t7[0], t7[1], t7[2],
                t3[0], t3[1], t3[2],
                t2[0], t2[1], t2[2],
                t6[0], t6[1], t6[2],
                t7[0], t7[1], t7[2],
            ]);
            let textureCoordinates = [];
            this.buffer.positionsGlBuffer = this.buffer.createBuffer(this.buffer.positionsVBO);
            this.buffer.normalGlBuffer = this.buffer.createBuffer(this.buffer.normalVBO);
            this.buffer.colorGlBuffer = this.buffer.createBuffer(this.buffer.colorVBO);
            this.buffer.selectionColorGlBuffer = this.buffer.createBuffer(this.buffer.selectionColorVBO);
            let positionCount = this.buffer.positionsVBO.length / 3;
            let indices = new Uint16Array(positionCount);
            this.buffer.indicesVBO = indices.map((obj, index) => {
                textureCoordinates.push(0);
                textureCoordinates.push(0);
                textureCoordinates.push(1);
                textureCoordinates.push(1);
                textureCoordinates.push(0);
                textureCoordinates.push(1);
                textureCoordinates.push(0);
                textureCoordinates.push(0);
                textureCoordinates.push(1);
                textureCoordinates.push(0);
                textureCoordinates.push(1);
                textureCoordinates.push(1);
                return index;
            });
            if (this.texture) {
                this.buffer.texture = this.texture;
            }
            else if (this.images) {
                let texture = this.buffer.createCubeTexture(this.images);
                this.buffer.texture = texture;
                this.texture = texture;
            }
            //this.buffer.textureVBO = new Float32Array(textureCoordinates);
            this.buffer.textureGlBuffer = this.buffer.createBuffer(this.buffer.textureVBO);
            this.buffer.indicesGlBuffer = this.buffer.createIndexBuffer(this.buffer.indicesVBO);
            this.buffer.indicesLength = this.buffer.indicesVBO.length;
            this.dirty = false;
        }
        return this.buffer;
    }
}
SkyBox.objectName = "Cube";
