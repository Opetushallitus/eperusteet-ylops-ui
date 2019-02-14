import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import VueProgressBar from 'vue-progressbar';

Vue.use(VueProgressBar, {
  color: '#def2ff',
  failedColor: 'red',
  height: '2px',
});

import { rootConfig } from '@/mainvue';

import '@/registerServiceWorker';
import '@/config/styles';

import { createLogger } from '@/stores/logger';

const logger = createLogger('Main');

const inDev = process.env.NODE_ENV === 'development';

Vue.config.productionTip = false;
Vue.config.devtools = inDev;
Vue.config.performance = inDev;

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
