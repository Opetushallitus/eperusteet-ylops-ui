import Vue from 'vue';

import '@/config/styles';
import { getRootConfig } from '@/mainvue';
import { createLogger } from '@shared/utils/logger';
import { Ulkopuoliset } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';

const logger = createLogger('Main');

Vue.config.productionTip = false;

async function getLokalisoinnit() {
  return (await Ulkopuoliset.getLokalisoinnit()).data as any;
}

async function main() {
  try {
    logger.info('Mounting #app');
    (new Vue(await getRootConfig())).$mount('#app');
    await Kielet.load(await getLokalisoinnit());
  }
  catch (err) {
    logger.error('Top level error:" ', err);
  }
}

main();
