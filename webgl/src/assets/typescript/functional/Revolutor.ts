import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

import Triangle from '../topology/Triangle.js';
import Vertex from '../topology/Vertex.js'
import Vertices from '../topology/Vertices.js'
import VerticesMatrix from '../topology/VerticesMatrix.js'
import Indices from '../topology/Indices.js';

/**
 * Revolutor
 */
export default class Revolutor {
  static revolute(positions: Array<vec3>, indices: Indices, density: number): VerticesMatrix {
    let origin = vec3.fromValues(0.0, 0.0, 0.0);
    let angleOffset = (360 / density);
    let verticesMatrix = new VerticesMatrix();
    for (let i = 0; i <= density; i++) {
      let vertices = new Vertices();
      let angle = Math.radian(i * angleOffset);
      positions.forEach((position, index) => {
        let rotatedPosition = vec3.rotateZ(vec3.create(), position, origin, angle);
        let textureCoordinateX = (i / density);
        let textureCoordinateY = 1 - (index / (positions.length - 1));
        let startTextureCoordinate = vec2.fromValues(textureCoordinateX, textureCoordinateY);
        let vertex = new Vertex.Builder()
          .position(rotatedPosition)
          .textureCoordinate(startTextureCoordinate)
          .index(indices.getAndNext())
          .build();
        vertices.push(vertex);
      });
      verticesMatrix.push(vertices);
    }
    return verticesMatrix;
  }
  static revoluteRange(positions: Array<vec3>, indices: Indices, density: number, lonlatRange: any): VerticesMatrix {
    let longitudeOffset = lonlatRange.longitudeMin + 180;

    let origin = vec3.fromValues(0.0, 0.0, 0.0);
    //let angleOffset = (360 / density);
    let angleOffset = ((lonlatRange.longitudeMin + lonlatRange.longitudeMax + 360) / density);
    let verticesMatrix = new VerticesMatrix();
    for (let i = 0; i <= density; i++) {
      let vertices = new Vertices();
      let angle = Math.radian(i * angleOffset);
      positions.forEach((position, index) => {
        let rotatedPosition = vec3.rotateZ(vec3.create(), position, origin, angle);
        let textureCoordinateX = (i / density);
        let textureCoordinateY = 1 - (index / (positions.length - 1));
        let startTextureCoordinate = vec2.fromValues(textureCoordinateX, textureCoordinateY);
        let vertex = new Vertex.Builder()
          .position(rotatedPosition)
          .textureCoordinate(startTextureCoordinate)
          .index(indices.getAndNext())
          .build();
        vertices.push(vertex);
      });
      verticesMatrix.push(vertices);
    }
    return verticesMatrix;
  }
  static convertTriangles(verticesMatrix: VerticesMatrix): Array<Triangle> {
    let triangles: Array<Triangle> = []; 
    for (let loop = 0; loop < verticesMatrix.length - 1; loop++) {
      let crntVertices = verticesMatrix.get(loop);
      let nextVertices = verticesMatrix.getNext(loop);
      for (let verticeLoop = 0; verticeLoop < crntVertices.length - 1; verticeLoop++) {
        let crntCrntVertex = crntVertices.get(verticeLoop);
        let crntNextVertex = crntVertices.getNext(verticeLoop);
        let nextCrntVertex = nextVertices.get(verticeLoop);
        let nextNextVertex = nextVertices.getNext(verticeLoop);
        let triangleTop = new Triangle(crntCrntVertex, nextNextVertex, nextCrntVertex);
        let triangleBottom = new Triangle(crntCrntVertex, crntNextVertex, nextNextVertex);
        triangleTop.calcNormal();
        triangleBottom.calcNormal();
        triangles.push(triangleTop);
        triangles.push(triangleBottom);
      }
    }
    return triangles;
  }
}