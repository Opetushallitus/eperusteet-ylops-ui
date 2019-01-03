import Vue from 'vue';
import '@/config/bootstrap';
import '@/config/fontawesome';
import '@/config/styles';

import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
