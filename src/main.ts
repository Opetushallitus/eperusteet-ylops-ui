import '@/config/styles';
import { getRootConfig } from '@/mainvue';
// import '@/registerServiceWorker';
import { createLogger } from '@/stores/logger';
import Vue from 'vue';
import { router } from '@/router';

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

Vue.config.errorHandler = (err, vm, info) => {
  router.replace({
    name: 'virhe',
    query: {
      viesti: 'virhe-nakyma-tapahtuma',
      virhe: err.message,
      komponentti: vm.$options.name,
      info
    },
  });
};

main();
