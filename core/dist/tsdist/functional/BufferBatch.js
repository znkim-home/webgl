import BatchObject from '@/renderable/BatchObject.js';
Float32Array.prototype.concat = function () {
    var bytesPerIndex = 4, buffers = Array.prototype.slice.call(arguments);
    buffers.unshift(this);
    buffers = buffers.map(function (item) {
        if (item instanceof Float32Array) {
            return item.buffer;
        }
        else if (item instanceof ArrayBuffer) {
            if (item.byteLength / bytesPerIndex % 1 !== 0) {
                throw new Error('One of the ArrayBuffers is not from a Float32Array');
            }
            return item;
        }
        else {
            throw new Error('You can only concat Float32Array, or ArrayBuffers');
        }
    });
    var concatenatedByteLength = buffers
        .map(function (a) { return a.byteLength; })
        .reduce(function (a, b) { return a + b; }, 0);
    var concatenatedArray = new Float32Array(concatenatedByteLength / bytesPerIndex);
    var offset = 0;
    buffers.forEach(function (buffer) {
        concatenatedArray.set(new Float32Array(buffer), offset);
        offset += buffer.byteLength / bytesPerIndex;
    });
    return concatenatedArray;
};
var BufferBatch = /** @class */ (function () {
    function BufferBatch() {
    }
    BufferBatch.batch100 = function (gl, renderableObjs) {
        var results = [];
        var unit = 500;
        for (var loop = 0; loop < renderableObjs.length; loop += unit) {
            var result = this.batch(gl, renderableObjs.slice(loop, loop + unit));
            results.push(result);
        }
        return results;
    };
    BufferBatch.batch = function (gl, renderableObjs) {
        var positionsList = [];
        var normalsList = [];
        var colorsList = [];
        var selectionColorsList = [];
        var textureCoordinatesList = [];
        var textureList = [];
        renderableObjs.forEach(function (renderableObj) {
            var position = renderableObj.position;
            var buffer = renderableObj.getBuffer(gl);
            var movedPositions = [];
            if (buffer.positionsVBO) {
                buffer.positionsVBO.forEach(function (VBO, index) {
                    var count = index % 3;
                    if (count == 0) {
                        movedPositions.push(VBO + position[0]);
                    }
                    else if (count == 1) {
                        movedPositions.push(VBO + position[1]);
                    }
                    else {
                        movedPositions.push(VBO + position[2]);
                    }
                });
            }
            positionsList.push(movedPositions);
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
        var buffer = {
            positions: this.concatFloat32(positionsList),
            normals: this.concatFloat32(normalsList),
            colors: this.concatFloat32(colorsList),
            selectionColors: this.concatFloat32(selectionColorsList),
            textureCoordinates: this.concatFloat32(textureCoordinatesList),
            textures: textureList,
        };
        return new BatchObject(buffer);
    };
    BufferBatch.concatFloat32 = function (floatObjs) {
        if (!floatObjs || floatObjs.length <= 0) {
            console.log("========================");
            return;
        }
        var result = [];
        for (var loop = 0; loop < floatObjs.length; loop++) {
            this.concat(result, floatObjs[loop]);
        }
        return new Float32Array(result);
    };
    BufferBatch.concat = function (target, list) {
        list.forEach(function (data) {
            target.push(data);
        });
    };
    return BufferBatch;
}());
export default BufferBatch;
