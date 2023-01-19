const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

Float32Array.prototype.concat = function() {
	var bytesPerIndex = 4,
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
	var concatenatedByteLength = buffers
		.map(function (a) {return a.byteLength;})
		.reduce(function (a,b) {return a + b;}, 0);
	var concatenatedArray = new Float32Array(concatenatedByteLength / bytesPerIndex);
	var offset = 0;
	buffers.forEach(function (buffer) {
		concatenatedArray.set(new Float32Array(buffer), offset);
		offset += buffer.byteLength / bytesPerIndex;
	});
	return concatenatedArray;
};

import BatchObject from '../renderable/BatchObject.js';

export default class BufferBatch {

  static batch100(gl, renderableObjs) {
    let results = [];
    let unit = 500;
    for (let loop = 0; loop < renderableObjs.length; loop+= unit) {
      let result = this.batch(gl, renderableObjs.slice(loop, loop + unit));
      results.push(result);
    }
    return results;
  }

  static batch(gl, renderableObjs) {
    let positionsList = [];
    let normalsList = [];
    let colorsList = [];
    let selectionColorsList = [];
    let textureCoordinatesList = [];
    let textureList = [];
    renderableObjs.forEach((renderableObj) => {
      let position = renderableObj.position;
      let buffer = renderableObj.getBuffer(gl);
      let movedPositions = [];
      buffer.positionsVBO.forEach((VBO, index) =>{
        let count = index % 3;
        if (count == 0) {
          movedPositions.push(VBO + position[0]);
        } else if (count == 1) {
          movedPositions.push(VBO + position[1]);
        } else {
          movedPositions.push(VBO + position[2]);
        }
      })
      positionsList.push(movedPositions);
      normalsList.push(buffer.normalVBO);
      colorsList.push(buffer.colorVBO);
      selectionColorsList.push(buffer.selectionColorVBO);
      textureCoordinatesList.push(buffer.textureVBO);
      textureList.push(buffer.texture);
    }); 
    let buffer = {
      positions : this.concatFloat32(positionsList),
      normals : this.concatFloat32(normalsList),
      colors : this.concatFloat32(colorsList),
      selectionColors : this.concatFloat32(selectionColorsList),
      textureCoordinates : this.concatFloat32(textureCoordinatesList),
      textures : textureList,
    };
    return new BatchObject(buffer);
  }

  static concatFloat32(floatObjs) {
    if (!floatObjs || floatObjs.length <= 0) {
      console.log("========================");
      return;
    }
    
    let result = [];
    for (let loop = 0; loop < floatObjs.length; loop++) {
      //result = result.concat(floatObjs[loop]);
      this.concat(result, floatObjs[loop]);
    }
    return new Float32Array(result);
  }
  static concat(target, list) {
    list.forEach((data) => {
      target.push(data); 
    });
  }
}