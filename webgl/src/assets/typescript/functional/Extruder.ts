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
    let topVertices: Vertices = new Vertices(positions.map((position) => {
      let positionVec3 = vec3.fromValues(position[0], position[1], position[2] + height);
      return new Vertex.Builder()
      .index(indices.getAndNext())
      .position(positionVec3)
      .build();
    }));
    let bottomVertices: Vertices = new Vertices(positions.map((position) => {
      let positionVec3 = vec3.fromValues(position[0], position[1], position[2]);
      return new Vertex.Builder()
      .index(indices.getAndNext())
      .position(positionVec3)
      .build();
    }).reverse(), true);
    let allVerticesList = new VerticesList();
    let topVerticesList = Tessellator.tessellate(topVertices);
    let bottomVerticesList = Tessellator.tessellate(bottomVertices);
    let sideVerticeList = this.createSideVerticeList(topVertices, bottomVertices, indices);
    allVerticesList.concat(topVerticesList);
    allVerticesList.concat(bottomVerticesList);
    allVerticesList.concat(sideVerticeList);
    return {
      up : topVerticesList,
      side : sideVerticeList,
      down : bottomVerticesList,
      all : allVerticesList
    };
  }
  static convertTriangles(verticesList: VerticesList): Array<Triangle> {
    let triangles: Array<Triangle> = []; 
    for (let loop = 0; loop < verticesList.length; loop++) {
      let crntVertices = verticesList.get(loop);
      for (let verticeLoop = 1; verticeLoop < crntVertices.length - 1; verticeLoop++) {
        let originVertex = crntVertices.get(0);
        let crntVertex = crntVertices.get(verticeLoop);
        let nextVertex = crntVertices.getNext(verticeLoop);
        let triangleTop;
        if (crntVertices.isCW) {
          triangleTop = new Triangle(originVertex, nextVertex, crntVertex);
        } else {
          triangleTop = new Triangle(originVertex, crntVertex, nextVertex);
        }
        triangleTop.calcNormal();
        triangles.push(triangleTop);
      }
    }
    return triangles;
  }
  static convertSideTriangles(verticesList: VerticesList): Array<Triangle> {
    let triangles: Array<Triangle> = []; 
    for (let loop = 0; loop < verticesList.length; loop++) {
      let crntVertices = verticesList.get(loop);
      let nextVertices = verticesList.getNext(loop);
      for (let verticeLoop = 0; verticeLoop < crntVertices.length; verticeLoop++) {
        let crntCrntVertex = crntVertices.get(0);
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
    bottomVertices.vertices.reverse();
    let verticesList = new VerticesList();
    topVertices.forEach((vertex, index) => {
      let topCrntVertex: Vertex = topVertices.get(index);
      let topNextVertex: Vertex = topVertices.getNext(index);
      let bottomCrntVertex: Vertex = bottomVertices.get(index);
      let bottomNextVertex: Vertex = bottomVertices.getNext(index);
      let vertice = new Vertices();
      vertice.push(new Vertex
        .Builder()
        .index(indices.getAndNext())
        .position(topCrntVertex.position)
        .textureCoordinate(vec2.fromValues(0,1))
        .build()
      );
      vertice.push(new Vertex
        .Builder()
        .index(indices.getAndNext())
        .position(bottomCrntVertex.position)
        .textureCoordinate(vec2.fromValues(0,0))
        .build()
      );
      vertice.push(new Vertex
        .Builder()
        .index(indices.getAndNext())
        .position(bottomNextVertex.position)
        .textureCoordinate(vec2.fromValues(1,0))
        .build()
      );
      vertice.push(new Vertex
        .Builder()
        .index(indices.getAndNext())
        .position(topNextVertex.position)
        .textureCoordinate(vec2.fromValues(1,1))
        .build()
      );
      verticesList.push(vertice);
    }) 
    return verticesList;
  }
}