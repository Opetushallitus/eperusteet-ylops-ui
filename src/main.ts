import Vue from 'vue';

import { Kielet, i18n } from '@/stores/kieli';
import { Kayttajat } from '@/stores/kayttaja';
import { rootConfig } from '@/mainvue';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import '@/registerServiceWorker';
import '@/config/bootstrap';
import '@/config/fontawesome';

Vue.config.productionTip = false;

async function main() {
  await Kielet.init();
  await Kayttajat.init();
  (new Vue(rootConfig)).$mount('#app');
}


main();
