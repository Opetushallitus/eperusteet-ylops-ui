import Vue from 'vue';

import '@shared/config/styles';
import { getRootConfig } from '@/mainvue';
import { createLogger } from '@shared/utils/logger';
import { registerIconColorSchemeChange } from '@shared/utils/icon';

const logger = createLogger('Main');

Vue.config.productionTip = false;

async function main() {
  try {
    logger.info('Mounting #app');
    registerIconColorSchemeChange();
    (new Vue(await getRootConfig())).$mount('#app');
  }
  catch (err) {
    logger.error('Top level error:" ', err);
  }
}

main();
