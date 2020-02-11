import Vue from 'vue';

import '@/config/styles';
import { getRootConfig } from '@/mainvue';
import { createLogger } from '@shared/utils/logger';

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
