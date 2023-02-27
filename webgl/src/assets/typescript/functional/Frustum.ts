import { vec3 } from 'gl-matrix';
import Plane from '../geometry/GeometryPlane';

export default class Frustum {
  near: number;
	far: number;
	fovyRad: number;
	tangentOfHalfFovy: number;
	fovRad: number;
	aspectRatio: number;
  planes: Array<Plane> = [];

  constructor() {
    this.init();
  }
  init(): void {
    
  }
}