import { mat2, mat3, mat4, vec2, vec3, vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
import Ellipsoid from './primitive/Ellipsoid.js'

export default class Globe extends Ellipsoid {
  static objectName: string = "Globe";
  constructor(options: any) {
    let equatorialRadius = 6378137.0; // equatorialRadius m
    let polarRadius = 6356752.3142; // polarRadius m
    //let equatorialRadius = 63781.0; // equatorialRadius m
    //let polarRadius = 63567.3142; // polarRadius m

    let verticalRadius = polarRadius;
    let horizontalRadius = equatorialRadius;
    options.verticalRadius = verticalRadius;
    options.horizontalRadius = horizontalRadius;
    options.position.z = options.position.z - options.verticalRadius;
    super(options);
  }
}