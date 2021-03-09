import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Axios from 'axios'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';


createApp(App).config.globalProperties.Axios = Axios
createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
