export default class VerticesList {
    constructor(verticesList) {
        this._dirty = false;
        this._verticesLength = 0;
        this.verticesList = [];
        if (verticesList) {
            verticesList.forEach((vertices) => {
                this.verticesList.push(vertices);
                this._verticesLength += vertices.length;
            });
        }
    }
    forEach(callback) {
        this.verticesList.forEach(callback);
    }
    push(vertex) {
        this.verticesList.push(vertex);
    }
    pop() {
        return this.verticesList.pop();
    }
    get(index) {
        return this.verticesList.get(index);
    }
    getNext(index) {
        return this.verticesList.getNext(index);
    }
    getPrev(index) {
        return this.verticesList.getPrev(index);
    }
    getNextIndex(index) {
        return this.verticesList.getNextIndex(index);
    }
    getPrevIndex(index) {
        return this.verticesList.getPrevIndex(index);
    }
    concat(verticesList) {
        this.verticesList = this.verticesList.concat(verticesList.verticesList);
        this._dirty = true;
    }
    get length() {
        return this.verticesList.length;
    }
    set length(value) {
        this.verticesList.length = value;
    }
    get verticesLength() {
        if (this._dirty) {
            this._verticesLength = 0;
            this.verticesList.forEach((vertices) => {
                this._verticesLength += vertices.length;
            });
            this._dirty = false;
        }
        return this._verticesLength;
    }
}
