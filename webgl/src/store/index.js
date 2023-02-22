import { createStore } from 'vuex'

export default createStore({
  state: {
    globalOptions: {
      cullFace : true,
      depthTest : true,
      fovyDegree : 70,
      aspect : undefined,
      near : 0.1,
      far : 100000000.0,
      pointSize : 5.0,
      lineWidth : 3.0,
      debugMode : true,
      enableSsao : true,
      enableGlobalLight : true,
      enableEdge : true,
      sunRadius : 2048,
      wireFrame : false,
    },
    selectedObjects: [],
  },
  getters: {
    getGlobalOptions(state) {
      return state.globalOptions;
    },
    getSelectedObjects(state) {
      return state.selectedObjects;
    }
  },
  mutations: {
    selectObjects(state, selectedObjects){
      state.selectObjects = selectedObjects;
    }
  },
  actions: {

  },
  modules: {

  }
})
