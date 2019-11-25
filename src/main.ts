import '@/config/styles';
import { getRootConfig } from '@/mainvue';
import { createLogger } from '@/stores/logger';
import Vue from 'vue';

const logger = createLogger('Main');

Vue.config.productionTip = false;

async function main() {
  Vue.config.errorHandler = (err, vm, info) => {
    // if (process.env.NODE_ENV !== 'development') {
    //   router.replace({
    //     name: 'virhe',
    //     query: {
    //       viesti: 'virhe-nakyma-tapahtuma',
    //       virhe: err.message,
    //       komponentti: vm.$options.name,
    //       info
    //     },
    //   });
    // }
    // else {
    console.error(err, vm, info);
    // }
  };

  try {
    logger.info('Mounting #app');
    (new Vue(await getRootConfig())).$mount('#app');
  }
  catch (err) {
    logger.error('Top level error:" ', err);
  }
}

main();
