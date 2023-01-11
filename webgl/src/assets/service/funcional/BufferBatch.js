const {mat2, mat3, mat4, vec2, vec3, vec4} = self.glMatrix; // eslint-disable-line no-unused-vars

export default class BufferBatch {
  static batch(renderableObjs) {

    renderableObjs.forEach((renderableObj) => {


      renderableObj.getBuffer();


    }); 
  }
}