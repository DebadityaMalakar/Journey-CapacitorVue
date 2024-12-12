import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "../css/tw.css";
import "../css/fonts.css";
// Create and mount the Vue app, with router included
createApp(App)
  .use(router)  // Use the router
  .mount('#app')
