import BoundingBox from "./BoundingBox";

export default class QuadTree {
  children: Array<QuadTree>;
  boundindBox: BoundingBox;
  constructor() {
    this.init();
  }
  init(): void {
    this.children = [];
  }
  forEach(callback: (value: QuadTree, index: number) => void) {
    this.children.forEach(callback);
  }
}