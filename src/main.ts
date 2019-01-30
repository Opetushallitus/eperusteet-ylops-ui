import Vue from 'vue';

import { Kielet, i18n } from '@/stores/kieli';
import { Kayttajat } from '@/stores/kayttaja';
import { rootConfig } from '@/mainvue';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import '@/registerServiceWorker';
import '@/config/bootstrap';
import '@/config/fontawesome';
import { editointi } from '@/stores/editointi';

import { createLogger } from '@/stores/logger';
const logger = createLogger('Main');

Vue.config.productionTip = false;
Vue.config.devtools = false;
Vue.config.performance = process.env.NODE_ENV === 'development';

async function main() {
  await Kielet.init();
  await Kayttajat.init();
  logger.info('Mounting #app');
  (new Vue(rootConfig)).$mount('#app');
}


main();
