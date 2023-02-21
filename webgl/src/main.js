import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const WEBGL_APP = createApp(App);

WEBGL_APP.config.globalProperties.$store = store;

WEBGL_APP.use(store);
WEBGL_APP.use(router);
WEBGL_APP.mount('#app');