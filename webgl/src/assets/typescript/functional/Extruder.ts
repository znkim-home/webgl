import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars

import Tessellator from './Tessellator.js';

import Triangle from '../topology/Triangle.js';
import Vertex from '../topology/Vertex.js'
import Vertices from '../topology/Vertices.js'
import VerticesList from '../topology/VerticesList.js'
import VerticesMatrix from '../topology/VerticesMatrix.js'
import Indices from '../topology/Indices.js';

/**
 * Extruder
 */
export default class Extruder {
  static extrude(positions: Array<vec3>, indices: Indices, height: number) {
    let topPositions: Array<vec3> = positions;
    let bottomPositions: Array<vec3> = positions.map((position) => vec3.fromValues(position[0], position[1], position[2] + height));
    let topVertices = new Vertices(topPositions.map((position) => {
      return new Vertex.Builder()
      .index(indices.getAndNext())
      .position(position)
      .build();
    }));
    let bottomVertices = new Vertices(bottomPositions.map((position) => {
      return new Vertex.Builder()
      .index(indices.getAndNext())
      .position(position)
      .build();
    }));
    //let topVerticesList = Tessellator.tessellate(topVertices, indices);
    let bottomVerticesList = Tessellator.tessellate(bottomVertices, indices);
    //let sideVerticeList = this.createSideVerticeList(topVertices, bottomVertices, indices);
    //topVerticesList.concat(bottomVerticesList);
    //topVerticesList.concat(sideVerticeList);
    return bottomVerticesList;
  }
  static convertTriangles(verticesList: VerticesList): Array<Triangle> {
    let triangles: Array<Triangle> = []; 
    for (let loop = 0; loop < verticesList.length; loop++) {
      let crntVertices = verticesList.get(loop);
      let nextVertices = verticesList.getNext(loop);
      for (let verticeLoop = 0; verticeLoop < crntVertices.length; verticeLoop++) {
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
  static createSideVerticeList(topVertices: Vertices, bottomVertices: Vertices, indices: Indices): VerticesList {
    let verticesList = new VerticesList();
    topVertices.forEach((vertex, index) => {
      if (!index) {
        return;
      }
      let topCrntVertex: Vertex = topVertices.get(index);
      let topNextVertex: Vertex = topVertices.getNext(index);
      let bottomCrntVertex: Vertex = bottomVertices.get(index);
      let bottomNextVertex: Vertex = bottomVertices.getNext(index);
      let vertice = new Vertices();
      vertice.push(new Vertex
        .Builder()
        .index(indices.getAndNext())
        .position(topCrntVertex.position)
        .textureCoordinate(vec2.fromValues(0,0))
        .build()
      );
      vertice.push(new Vertex
        .Builder()
        .index(indices.getAndNext())
        .position(topNextVertex.position)
        .textureCoordinate(vec2.fromValues(1,0))
        .build()
      );
      vertice.push(new Vertex
        .Builder()
        .index(indices.getAndNext())
        .position(bottomCrntVertex.position)
        .textureCoordinate(vec2.fromValues(0,1))
        .build()
      );
      vertice.push(new Vertex
        .Builder()
        .index(indices.getAndNext())
        .position(bottomNextVertex.position)
        .textureCoordinate(vec2.fromValues(1,1))
        .build()
      );
      verticesList.push(vertice);
    }) 
    return verticesList;
  }
}