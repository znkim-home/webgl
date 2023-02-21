export default class Vertex {
    constructor(builder) {
        this.index = builder._index;
        this.position = builder._position;
        this.normal = builder._normal;
        this.textureCoordinate = builder._textureCoordinate;
        this.color = builder._color;
    }
}
Vertex.Builder = class {
    index(index) {
        this._index = index;
        return this;
    }
    position(position) {
        this._position = position;
        return this;
    }
    normal(normal) {
        this._normal = normal;
        return this;
    }
    textureCoordinate(textureCoordinate) {
        this._textureCoordinate = textureCoordinate;
        return this;
    }
    color(color) {
        this._color = color;
        return this;
    }
    build() {
        return new Vertex(this);
    }
};
