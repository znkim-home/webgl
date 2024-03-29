import Buffer from '../Buffer.js';
import Renderable from '../abstract/Renderable.js';
import Indices from '../topology/Indices.js';
import Revolutor from '../functional/Revolutor.js';
import { mat4, vec3, vec4 } from 'gl-matrix';
export default class MapTile extends Renderable {
    constructor(options) {
        super();
        this.init(options);
    }
    init(options) {
        //let equatorialRadius = 6378137.0; // equatorialRadius m
        //let polarRadius = 6356752.3142; // polarRadius m
        let polarRadius = 63567.3142; // polarRadius m
        let equatorialRadius = 63781.0; // equatorialRadius m
        /*this.lonlatRange = {
          latitudeMin : -90,
          latitudeMax : 90,
          longitudeMin : -180,
          longitudeMax : 180,
        };*/
        this.lonlatRange = {
            latitudeMin: -90,
            latitudeMax: 0,
            longitudeMin: -180,
            longitudeMax: -90,
        };
        if (options === null || options === void 0 ? void 0 : options.lonlatRange)
            this.lonlatRange = options.lonlatRange;
        this.triangles = [];
        this.verticalRadius = polarRadius;
        this.horizontalRadius = equatorialRadius;
        this.height = 3.0;
        this.density = 64;
        this.name = "Untitled Cylinder";
        if (options === null || options === void 0 ? void 0 : options.verticalRadius)
            this.verticalRadius = options.verticalRadius;
        if (options === null || options === void 0 ? void 0 : options.horizontalRadius)
            this.horizontalRadius = options.horizontalRadius;
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
            let color = this.color;
            let selectionColor = this.selectionColor;
            let colors = [];
            let selectionColors = [];
            let positions = [];
            let normals = [];
            let textureCoordinates = [];
            this.coordinates = [];
            let verticalRadius = this.verticalRadius;
            let horizontalRadius = this.horizontalRadius;
            let lattitudeOffset = (this.lonlatRange.latitudeMin) + 90;
            //let angleOffset = (180 / this.density);
            let angleOffset = ((this.lonlatRange.latitudeMin - this.lonlatRange.latitudeMax + 180) / this.density);
            let origin = vec3.fromValues(0.0, 0.0, 0.0);
            let verticalVec3 = vec3.fromValues(0.0, 0.0, verticalRadius);
            let horizontalVec3 = vec3.fromValues(0.0, 0.0, horizontalRadius);
            let originDot = vec3.dot(horizontalVec3, horizontalVec3);
            let radiusOffset = verticalRadius;
            for (let i = 0; i <= this.density; i++) {
                let angle = Math.radian(lattitudeOffset + (i * angleOffset));
                let rotatedHorizontalVec3 = vec3.rotateX(vec3.create(), horizontalVec3, origin, angle);
                let rotatedHorizontalDot = vec3.dot(horizontalVec3, rotatedHorizontalVec3);
                let dotRatio = (rotatedHorizontalDot / originDot);
                let addRadius = (radiusOffset * dotRatio);
                //addRadius = addRadius > 0 ? verticalRadius + addRadius : addRadius - verticalRadius;
                console.log(addRadius);
                vec3.set(rotatedHorizontalVec3, rotatedHorizontalVec3[0], rotatedHorizontalVec3[1], addRadius);
                this.coordinates.push(rotatedHorizontalVec3);
            }
            let outerPositions = this.coordinates.map((coordinate) => vec3.fromValues(coordinate[0], coordinate[1], coordinate[2]));
            let indicesObject = new Indices();
            let verticesMatrix = Revolutor.revoluteRange(outerPositions, indicesObject, this.density, this.lonlatRange);
            let triangles = Revolutor.convertTriangles(verticesMatrix);
            let indices = [];
            triangles.forEach((triangle) => {
                let validation = triangle.validate();
                triangle.vertices.forEach(vertex => {
                    if (vertex.color === undefined) {
                        vertex.color = this.color;
                    }
                    if (validation) {
                        indices.push(vertex.index);
                    }
                });
            });
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
    createRandomColor() {
        let r = Math.round(Math.random() * 10) / 10;
        let g = Math.round(Math.random() * 10) / 10;
        let b = Math.round(Math.random() * 10) / 10;
        return vec4.fromValues(r, g, b, 1.0);
    }
    radiusAtLatitudeDeg(latDeg) {
        var latRad = latDeg * Math.PI / 180.0;
        var a = 6378137.0; // equatorialRadius
        var b = 6356752.3142; // polarRadius
        var a2 = 40680631590769.0; // equatorialRadiusSquared;
        var b2 = 40408299984087.05552164; //polarRadiusSquared;
        var sin = Math.sin(latRad);
        var cos = Math.cos(latRad);
        var sin2 = sin * sin;
        var cos2 = cos * cos;
        var radius = (a * b) / (Math.sqrt(a2 * sin2 + b2 * cos2));
        return radius;
    }
}
MapTile.objectName = "Elipsoid";
