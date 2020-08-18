import Vue from 'vue';

import '@shared/config/styles';
import { getRootConfig } from '@/mainvue';
import { createLogger } from '@shared/utils/logger';
import { Ulkopuoliset } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';
import { Kayttajat } from '@/stores/kayttaja';
import { registerIconColorSchemeChange } from '@shared/utils/icon';

const logger = createLogger('Main');

Vue.config.productionTip = false;

async function getLokalisoinnit() {
  return (await Ulkopuoliset.getLokalisoinnit()).data as any;
}

async function main() {
  try {
    logger.info('Mounting #app');
    await Kayttajat.init();
    registerIconColorSchemeChange();
    (new Vue(await getRootConfig())).$mount('#app');
    await Kielet.load(await getLokalisoinnit());
  }
  catch (err) {
    logger.error('Top level error:" ', err);
  }
}

main();
