import Buffer from '@/assets/webgl/Buffer.js';
import Renderable from '@/assets/webgl/abstract/Renderable.js';
import Triangle from '@/assets/webgl/geometry/Triangle';

const { mat2, mat3, mat4, vec2, vec3, vec4 } = self.glMatrix; // eslint-disable-line no-unused-vars

export default class Obj extends Renderable {
  constructor(options, objData) {
    super();
    this.init(options, objData);
  }
  init(options, objData) {
    this.triangles = [];
    this.radius = 1.0;
    this.height = 3.0;
    this.density = 36;
    this.scale = 1.0;

    this.name = "Untitled OBJ File";

    if (options?.radius) this.radius = options.radius;
    if (options?.height) this.height = options.height;
    if (options?.density) this.density = options.density;
    if (options?.position) this.position = vec3.set(this.position, options.position.x, options.position.y, options.position.z);
    if (options?.rotation) this.rotation = vec3.set(this.rotation, options.rotation.pitch, options.rotation.roll, options.rotation.heading);
    if (options?.color) this.color = vec4.set(this.color, options?.color.r, options?.color.g, options?.color.b, options?.color.a);
    if (options?.image) this.image = options.image;
    if (options?.scale) this.scale = options.scale;

    this.objData = objData;
  }
  render(gl, shaderInfo, frameBufferObjs) {
    let tm = this.getTransformMatrix();
    let rm = this.getRotationMatrix();
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.objectMatrix, false, tm);
    gl.uniformMatrix4fv(shaderInfo.uniformLocations.rotationMatrix, false, rm);
    let buffer = this.getBuffer(gl, false);
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
      let color = this.color;
      let selectionColor = this.selectionColor;
      let colors = [];
      let selectionColors = [];
      let positions = [];
      let normals = [];
      let textureCoordinates = [];
      //let indices = [];
      let coordinates = [];

      let objData = this.objData;



      //let pt = PolyTree;
      //let house = House;
      

      let scaler = this.scale;
      /*let randomValue = Math.randomInt();
      if (randomValue % 3 == 0) {
        pt = House;
        scaler = 1;
      } else if (randomValue % 3 == 1) {
        pt = PolyTree;
        scaler = 1.5;
      } else {
        pt = WoodenWatch;
        scaler = 5;
      }*/
      //pt = house;
      //pt = PolyTree;

      let minX = Number.MAX_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;
      let minZ = Number.MAX_SAFE_INTEGER;
      let maxX = Number.MIN_SAFE_INTEGER;
      let maxY = Number.MIN_SAFE_INTEGER;
      let maxZ = Number.MIN_SAFE_INTEGER;

      let triangles = [];
      objData.vertices.forEach((vertice) => {
        let xyz = vertice.split(" ").filter(block => block !== '');
        let x = xyz[0] * scaler;
        let y = xyz[1] * scaler;
        let z = xyz[2] * scaler;
        coordinates.push(vec3.fromValues(x, z, y));
      });

      let allCoordinates = [];
      objData.allVertices.forEach((vertice) => {
        let xyz = vertice.split(" ").filter(block => block !== '');
        let x = xyz[0] * scaler;
        let y = xyz[1] * scaler;
        let z = xyz[2] * scaler;

        if (minX > x) minX = x;
        if (minY > y) minY = y;
        if (minZ > z) minZ = z;
        if (maxX < x) maxX = x;
        if (maxY < y) maxY = y;
        if (maxZ < z) maxZ = z;
        allCoordinates.push(vec3.fromValues(x, z, y));
      });
      console.log(minX, minY, minZ, maxX, maxY, maxZ);

      let sizeX = (minX * -1) + maxX;
      let sizeY = (minY * -1) + maxY; 
      let sizeZ = (minZ * -1) + maxZ; 
      console.log(sizeX, sizeY, sizeZ);

      /*pt.vertices.replaceAll('v ', '').split('\n').forEach((vertice) => {
        let xyz = vertice.split(" ");
        coordinates.push(vec3.fromValues(xyz[0] * scaler, xyz[2] * scaler, xyz[1] * scaler));
      });*/
      /*pt.normals.replaceAll('vn ', '').split('\n').forEach((normal) => {
        normal.split(" ").forEach((data) => {
          normals.push(data);
        });
      });*/
      /*pt.textureCoordinates.replaceAll('vt ', '').split('\n').forEach((textureCoordinate) => {
        textureCoordinate.split(" ").forEach((data) => {
          textureCoordinates.push(data);
        });
      });*/

      objData.faces.forEach((face) => {
        let splitedFaces = face.split(" ").filter(block => block !== '');
        let length = splitedFaces.length;
        if (length >= 3) {
          let face = splitedFaces.map((theIndex) => {
            return parseInt(theIndex.split("/")[0]);
          })
          let theCoordinates = face.map((theIndex) => {
            //theIndex = theIndex.replace("-", "");
            if (theIndex < 0) {
              return coordinates[coordinates.length + theIndex];
            } else {
              return allCoordinates[theIndex - 1];
            }
          });
          for (let loop = 2; loop < length; loop++) {
            triangles.push(new Triangle(theCoordinates[0], theCoordinates[loop], theCoordinates[loop-1]));
            color.forEach((value) => colors.push(value));
            color.forEach((value) => colors.push(value));
            color.forEach((value) => colors.push(value));
          }
        } 
      });


      /*let testColor = vec4.fromValues(0.5, 0.3, 0.1, 0.0);
      pt.indices1.replaceAll('f ', '').split('\n').forEach((indicesText) => {
        let indicesSplited = indicesText.split(" ");
        let length = indicesSplited.length;
        if (length >= 3) {
          let theIndices = indicesSplited.map((theIndex) => {
            return theIndex.split("/")[0];
          })
          let theCoordinates = theIndices.map((theIndex) => {
            return coordinates[theIndex - 1];
          });
          for (let loop = 2; loop < length; loop++) {
            triangles.push(new Triangle(theCoordinates[0], theCoordinates[loop], theCoordinates[loop-1]));
            testColor.forEach((value) => colors.push(value));
            testColor.forEach((value) => colors.push(value));
            testColor.forEach((value) => colors.push(value));
          }
        } 
      });

      if (pt?.indices2) {
        pt.indices2.replaceAll('f ', '').split('\n').forEach((indicesText) => {
          let indicesSplited = indicesText.split(" ");
          let length = indicesSplited.length;
          if (length >= 3) {
            let theIndices = indicesSplited.map((theIndex) => {
              return theIndex.split("/")[0];
            })
            let theCoordinates = theIndices.map((theIndex) => {
              return coordinates[theIndex - 1];
            });
            for (let loop = 2; loop < length; loop++) {
              triangles.push(new Triangle(theCoordinates[0], theCoordinates[loop], theCoordinates[loop-1]));
              color.forEach((value) => colors.push(value));
              color.forEach((value) => colors.push(value));
              color.forEach((value) => colors.push(value));
            }
          } 
        });
      }*/

      triangles.forEach((triangle) => {
        let trianglePositions = triangle.positions;
        let normal = triangle.getNormal();
        trianglePositions.forEach((position) => { // vec3
          position.forEach((value) => positions.push(value));
          normal.forEach((value) => normals.push(value));
          //color.forEach((value) => colors.push(value));
          selectionColor.forEach((value) => selectionColors.push(value));
          
          /*let xoffset = bbox.maxx - bbox.minx;
          let yoffset = bbox.maxy - bbox.miny;
          let zoffset = bbox.maxz - bbox.minz;
          if (normal[0] == 1 || normal[0] == -1) {
            textureCoordinates.push((position[1] - bbox.miny) / yoffset);
            textureCoordinates.push((position[2] - bbox.minz) / zoffset);
          } else if (normal[1] == 1 || normal[1] == -1) {
            textureCoordinates.push((position[0] - bbox.minx) / xoffset);
            textureCoordinates.push((position[2] - bbox.minz) / zoffset);
          } else if (normal[2] == 1 || normal[2] == -1) {
            textureCoordinates.push((position[0] - bbox.minx) / xoffset);
            textureCoordinates.push((position[1] - bbox.miny) / yoffset);
          }*/
        });
      });


      this.coordinates = [];

      let indices = new Uint16Array(positions.length);
      this.buffer.indicesVBO = indices.map((obj, index) => index);
      //this.buffer.indicesVBO = new Uint16Array(indices);
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