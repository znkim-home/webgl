// abstract
export default class Renderable {
  constructor() {
    if (this.constructor === Renderable) {
      throw new Error("Renderable is abstract class. Created an instance of an abstract class.");
    }
  }
  render() {
    throw new Error("render() is abstract method. Abstract methods must be overriding.");
  }
}
