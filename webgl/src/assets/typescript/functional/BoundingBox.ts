import { vec3 } from 'gl-matrix';

export default class BoundingBox {
  origin: vec3;
  minimumX: number;
  minimumY: number;
  minimumZ: number;
  maximumX: number;
  maximumY: number;
  maximumZ: number;
  constructor(positionsVBO: Float32Array) {
    this.init();
    this.calcBoundary(positionsVBO);
  }
  init(): void {
    this.origin = vec3.fromValues(0, 0, 0);
    this.minimumX = Number.MAX_SAFE_INTEGER;
    this.minimumY = Number.MAX_SAFE_INTEGER;
    this.minimumZ = Number.MAX_SAFE_INTEGER;
    this.maximumX = Number.MIN_SAFE_INTEGER;
    this.maximumY = Number.MIN_SAFE_INTEGER;
    this.maximumZ = Number.MIN_SAFE_INTEGER;
  }
  calcBoundary(positionsVBO: Float32Array): void {
    if (positionsVBO.length > 0) {
      positionsVBO.forEach((positionVBO, index) => {
        let number = index % 2;
        if (number == 0) {
          this.minimumX = this.minimumX > positionVBO ? positionVBO : this.minimumX;
          this.maximumX = this.maximumX < positionVBO ? positionVBO : this.maximumX;
        } else if (number == 1) {
          this.minimumY = this.minimumY > positionVBO ? positionVBO : this.minimumY;
          this.maximumY = this.maximumY < positionVBO ? positionVBO : this.maximumY;
        } else {
          this.minimumZ = this.minimumZ > positionVBO ? positionVBO : this.minimumZ;
          this.maximumZ = this.maximumZ < positionVBO ? positionVBO : this.maximumZ;
        }
      });
      this.calcOrigin();
    } else {
      this.origin = vec3.fromValues(0, 0, 0);
      this.minimumX = 0;
      this.minimumY = 0;
      this.minimumZ = 0;
      this.maximumX = 0;
      this.maximumY = 0;
      this.maximumZ = 0;
    }
  }
  calcOrigin(): void {
    let offsetX = (this.maximumX - this.minimumX) / 2;
    let offsetY = (this.maximumY - this.minimumY) / 2;
    let offsetZ = (this.maximumZ - this.minimumZ) / 2;
    let originX = this.minimumX + offsetX;
    let originY = this.minimumY + offsetY;
    let originZ = this.minimumZ + offsetZ;
    this.origin = vec3.fromValues(originX, originY, originZ);
  }
  getBoundary() {
    return {
      'minimumX' : this.minimumX, 
      'maximumX' : this.maximumX,
      'minimumY' : this.minimumY, 
      'maximumY' : this.maximumY,
      'minimumZ' : this.minimumZ, 
      'maximumZ' : this.maximumZ,
    }
  }
}