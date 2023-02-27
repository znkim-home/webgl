import Renderable from "../abstract/Renderable";
import BoundingBox from "./BoundingBox";

export default class RenderableObjectList {
  renderableObjects: Array<Renderable>;
  boundingBoxObjects: Array<BoundingBox>;
  length: number;
  constructor() {
    this.init();
  }
  init(): void {
    this.renderableObjects = [];
  }
  findById(id: number): Renderable | undefined {
    let finded = this.renderableObjects.find((renderableObject: Renderable) => {
      return renderableObject.id === id;
    })
    return finded;
  }
  public set(renderableObjects: Array<Renderable>): void {
    this.renderableObjects = renderableObjects;
  }
  public get(): Array<any> {
    return this.renderableObjects;
  }
  push(renderableObject: Renderable): void {
    this.renderableObjects.push(renderableObject);
  }
  pop(): any {
    return this.renderableObjects.pop();
  }
  size(): number {
    return this.renderableObjects.length;
  }
  /*remove(id: number): any {
    let finded = this.findById(id);
    if (finded !== undefined && finded.length > 0) {
      let index = this.renderableObjects.indexOf(finded[0]);
      this.renderableObjects.splice(index, 1);
    }
  }*/
  removeAll(): void {
    this.renderableObjects.length = 0;
  }
}