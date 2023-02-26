import { vec3 } from 'gl-matrix';
import BoundingBox from './BoundingBox';

export default class BoundingSphere {
  origin: vec3;
  radius: number;
  minimumX: number;
  minimumY: number;
  minimumZ: number;
  maximumX: number;
  maximumY: number;
  maximumZ: number;
  constructor(boundingBox: BoundingBox) {
    this.init();
    this.calcSphere(boundingBox);
  }
  init(): void {
    this.origin = vec3.fromValues(0, 0, 0);
  }
  calcSphere(boundingBox: BoundingBox): void {
    let offsetX = (boundingBox.maximumX - boundingBox.minimumX) / 2;
    let offsetY = (boundingBox.maximumY - boundingBox.minimumY) / 2;
    let offsetZ = (boundingBox.maximumZ - boundingBox.minimumZ) / 2;
    let originX = boundingBox.minimumX + offsetX;
    let originY = boundingBox.minimumY + offsetY;
    let originZ = boundingBox.minimumZ + offsetZ;
    this.origin = vec3.fromValues(originX, originY, originZ);
    this.radius = Math.max(offsetX, offsetY, offsetZ);
  }
}