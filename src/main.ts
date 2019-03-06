import '@/config/styles';
import { rootConfig } from '@/mainvue';
import '@/registerServiceWorker';
import { createLogger } from '@/stores/logger';
import Vue from 'vue';

const logger = createLogger('Main');

Vue.config.productionTip = false;

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
