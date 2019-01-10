import Vue from 'vue';
import '@/config/bootstrap';
import '@/config/fontawesome';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import App from './App.vue';
import router from './router';
import { Kielet, i18n } from './stores/kieli';
import { Kayttajat } from './stores/kayttaja';
import { Virheet } from './stores/virheet';
import './registerServiceWorker';
import * as _ from 'lodash';

Vue.config.productionTip = false;

function errorCaptured(err: Error, vm: Vue, info: string) {
  Virheet.lisaaVirhe({
    path: vm.$route.path,
    state: _.cloneDeep(vm.$data),
    err: err.message,
    info,
  });
}

async function main() {
  await Kielet.init();
  await Kayttajat.init();

  new Vue({
    i18n,
    router,
    render: (h) => h(App),
    errorCaptured,
  }).$mount('#app');
}

main();
