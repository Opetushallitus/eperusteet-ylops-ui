import Vue from 'vue';

import { Kielet, i18n } from '@/stores/kieli';
import { Kayttajat } from '@/stores/kayttaja';
import { rootConfig } from '@/mainvue';

import '@/registerServiceWorker';
import '@/config/styles';

import { createLogger } from '@/stores/logger';

const logger = createLogger('Main');

Vue.config.productionTip = false;
Vue.config.devtools = false;
Vue.config.performance = process.env.NODE_ENV === 'development';

async function main() {
  try {
    await Kielet.init();
    await Kayttajat.init();
    logger.info('Mounting #app');
    (new Vue(rootConfig)).$mount('#app');
  }
  catch (err) {
    logger.error('Top level error:', err);
  }
}

main();
