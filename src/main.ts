import '@/config/styles';
import { getRootConfig } from '@/mainvue';
// import '@/registerServiceWorker';
import { createLogger } from '@/stores/logger';
import Vue from 'vue';

const logger = createLogger('Main');

Vue.config.productionTip = false;

async function main() {
  try {
    logger.info('Mounting #app');
    (new Vue(await getRootConfig())).$mount('#app');
  }
  catch (err) {
    logger.error('Top level error:" ', err);
  }
}

main();
