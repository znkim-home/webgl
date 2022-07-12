import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import AppMain from './components/AppMain.vue';

const WEBGL_APP = createApp(App);

WEBGL_APP.use(store);
WEBGL_APP.use(router);
WEBGL_APP.component('AppMain', AppMain);
WEBGL_APP.mount('#app');