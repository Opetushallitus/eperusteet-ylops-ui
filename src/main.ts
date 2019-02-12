import Vue from 'vue';

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
    logger.info('Mounting #app');
    (new Vue(rootConfig)).$mount('#app');
  }
  catch (err) {
    logger.error('Top level error:', err);
  }
}

main();
