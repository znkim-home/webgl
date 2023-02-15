import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix';

export default class Vertex {
  index: number;
  position: vec3;
  normal: vec3;
  textureCoordinate: vec2;
  color: vec4;
  constructor(builder: any) {
    this.index = builder._index;
    this.position = builder._position;
    this.normal = builder._normal;
    this.textureCoordinate = builder._textureCoordinate;
    this.color = builder._color;
  }
  static Builder = class {
    _index: number;
    _position: vec3;
    _normal: vec3;
    _textureCoordinate: vec2;
    _color: vec4;
    index(index: number) {
      this._index = index;
      return this;
    }
    position(position: vec3) {
      this._position = position;
      return this;
    }
    normal(normal: vec3) {
      this._normal = normal;
      return this;
    }
    textureCoordinate(textureCoordinate: vec2) {
      this._textureCoordinate = textureCoordinate;
      return this;
    }
    color(color: vec4) {
      this._color = color;
      return this;
    }
    build() {
      return new Vertex(this);
    }
  };
}