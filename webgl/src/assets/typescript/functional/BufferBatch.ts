import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import BatchObject from '../renderable/BatchObject.js';
import Renderable from '@/abstract/Renderable.js';

export default class BufferBatch {
  static batch100(gl: WebGLRenderingContext | WebGL2RenderingContext, renderableObjs: Array<Renderable>) {
    let results = [];
    let unit = 1000;
    for (let loop = 0; loop < renderableObjs.length; loop+= unit) {
      let result = this.batch(gl, renderableObjs.slice(loop, loop + unit));
      results.push(result);
    }
    return results;
  }
  static batch(gl: WebGLRenderingContext | WebGL2RenderingContext, renderableObjs: Array<Renderable>) {
    let indicesList: Array<Uint16Array> = [];
    let positionsList: Array<Float32Array> = [];
    let normalsList: Array<Float32Array> = [];
    let colorsList: Array<Float32Array> = [];
    let selectionColorsList: Array<Float32Array> = [];
    let textureCoordinatesList: Array<Float32Array> = [];
    let textureList: Array<WebGLTexture> = [];
    renderableObjs.forEach((renderableObj) => {
      let position = renderableObj.position;
      let buffer = renderableObj.getBuffer(gl);
      
      if (buffer.positionsVBO) {
        let movedPositionsArray: Array<number> = [];
        buffer.positionsVBO.forEach((VBO, index) =>{
          let count = index % 3;
          if (count == 0) {
            movedPositionsArray.push(VBO + position[0]);
          } else if (count == 1) {
            movedPositionsArray.push(VBO + position[1]);
          } else {
            movedPositionsArray.push(VBO + position[2]);
          }
        })
        positionsList.push(new Float32Array(movedPositionsArray));
      }
      if (buffer.indicesVBO) {
        indicesList.push(buffer.indicesVBO);
      }
      if (buffer.normalVBO) {
        normalsList.push(buffer.normalVBO);
      }
      if (buffer.colorVBO) {
        colorsList.push(buffer.colorVBO);
      }
      if (buffer.selectionColorVBO) {
        selectionColorsList.push(buffer.selectionColorVBO);
      }
      if (buffer.textureVBO) {
        textureCoordinatesList.push(buffer.textureVBO);
      }
      if (buffer.texture) {
        textureList.push(buffer.texture);
      }
    }); 
    let buffer = {
      indices: this.concatUint16(indicesList),
      positions : this.concatFloat32(positionsList),
      normals : this.concatFloat32(normalsList),
      colors : this.concatFloat32(colorsList),
      selectionColors : this.concatFloat32(selectionColorsList),
      textureCoordinates : this.concatFloat32(textureCoordinatesList),
      textures : textureList,
    };
    console.log(buffer.indices);
    return new BatchObject(buffer);
  }
  static concatUint16(floatObjs: Array<any>) {
    let indicesLength = 0;
    if (!floatObjs || floatObjs.length <= 0) {
      return;
    }
    let result: Array<any> = [];
    for (let loop = 0; loop < floatObjs.length; loop++) {
      this.concatIndices(result, floatObjs[loop], indicesLength);
      //indicesLength += floatObjs[loop].length; // no indicesLength only indicesMaxLength
      let indicesMaxValue = Math.max(...floatObjs[loop]);
      indicesLength += indicesMaxValue + 1;
    }
    return new Uint16Array(result);
  }
  static concatFloat32(floatObjs: Array<Float32Array>) {
    if (!floatObjs || floatObjs.length <= 0) {
      return;
    }
    let result: Array<any> = [];
    for (let loop = 0; loop < floatObjs.length; loop++) {
      this.concat(result, floatObjs[loop]);
    }
    return new Float32Array(result);
  }
  static concat(target: Array<any>, list: Float32Array) {
    list.forEach((data) => {
      target.push(data); 
    });
  }
  static concatIndices(target: Array<any>, list: Uint16Array, indicesOffset: number | 0) {
    list.forEach((data) => {
      target.push(data + indicesOffset); 
    });
  }
}

declare global {
  interface Float32Array {
    concat() :Float32Array;
  }
  interface Uint16Array {
    concat() :Uint16Array;
  }
}
Uint16Array.prototype.concat = function() {
	let bytesPerIndex = 4,
  buffers = Array.prototype.slice.call(arguments);
	buffers.unshift(this);
	buffers = buffers.map(function (item) {
  if (item instanceof Uint16Array) {
    return item.buffer;
  } else if (item instanceof ArrayBuffer) {
    if (item.byteLength / bytesPerIndex % 1 !== 0) {
      throw new Error('One of the ArrayBuffers is not from a Uint16Array');	
    }
    return item;
  } else {
    throw new Error('You can only concat Uint16Array, or ArrayBuffers');
  }
	});
	let concatenatedByteLength = buffers
		.map(function (a) {return a.byteLength;})
		.reduce(function (a,b) {return a + b;}, 0);
  let concatenatedArray = new Uint16Array(concatenatedByteLength / bytesPerIndex);
  let offset = 0;
	buffers.forEach(function (buffer) {
		concatenatedArray.set(new Uint16Array(buffer), offset);
		offset += buffer.byteLength / bytesPerIndex;
	});
	return concatenatedArray;
};

Float32Array.prototype.concat = function() {
	let bytesPerIndex = 4,
  buffers = Array.prototype.slice.call(arguments);
	buffers.unshift(this);
	buffers = buffers.map(function (item) {
  if (item instanceof Float32Array) {
    return item.buffer;
  } else if (item instanceof ArrayBuffer) {
    if (item.byteLength / bytesPerIndex % 1 !== 0) {
      throw new Error('One of the ArrayBuffers is not from a Float32Array');	
    }
    return item;
  } else {
    throw new Error('You can only concat Float32Array, or ArrayBuffers');
  }
	});
	let concatenatedByteLength = buffers
		.map(function (a) {return a.byteLength;})
		.reduce(function (a,b) {return a + b;}, 0);
  let concatenatedArray = new Float32Array(concatenatedByteLength / bytesPerIndex);
  let offset = 0;
	buffers.forEach(function (buffer) {
		concatenatedArray.set(new Float32Array(buffer), offset);
		offset += buffer.byteLength / bytesPerIndex;
	});
	return concatenatedArray;
};