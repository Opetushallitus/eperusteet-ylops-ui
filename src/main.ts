import '@/config/styles';
import _ from 'lodash';
import { getRootConfig } from '@/mainvue';
// import '@/registerServiceWorker';
import { createLogger } from '@/stores/logger';
import Vue from 'vue';
import { router } from '@/router';

const logger = createLogger('Main');

Vue.config.productionTip = false;

async function main() {
  if (process.env.NODE_ENV !== 'development') {
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
  }

  try {
    logger.info('Mounting #app');
    (new Vue(await getRootConfig())).$mount('#app');
  }
  catch (err) {
    logger.error('Top level error:" ', err);
  }
}

main();
