export default class VerticesMatrix {
    constructor(verticesMatrix) {
        this._dirty = false;
        this._verticesLength = 0;
        this.verticesMatrix = [];
        if (verticesMatrix) {
            verticesMatrix.forEach((vertices) => {
                this.verticesMatrix.push(vertices);
                this._verticesLength += vertices.length;
            });
        }
    }
    forEach(callback) {
        this.verticesMatrix.forEach(callback);
    }
    push(vertex) {
        this.verticesMatrix.push(vertex);
    }
    pop() {
        return this.verticesMatrix.pop();
    }
    get(index) {
        return this.verticesMatrix.get(index);
    }
    getNext(index) {
        return this.verticesMatrix.getNext(index);
    }
    getPrev(index) {
        return this.verticesMatrix.getPrev(index);
    }
    getNextIndex(index) {
        return this.verticesMatrix.getNextIndex(index);
    }
    getPrevIndex(index) {
        return this.verticesMatrix.getPrevIndex(index);
    }
    concat(verticesMatrix) {
        this.verticesMatrix = this.verticesMatrix.concat(verticesMatrix.verticesMatrix);
        this._dirty = true;
    }
    get length() {
        return this.verticesMatrix.length;
    }
    set length(value) {
        this.verticesMatrix.length = value;
    }
    get verticesLength() {
        if (this._dirty) {
            this._verticesLength = 0;
            this.verticesMatrix.forEach((vertices) => {
                this._verticesLength += vertices.length;
            });
            this._dirty = false;
        }
        return this._verticesLength;
    }
}
