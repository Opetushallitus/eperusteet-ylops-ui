import '@/config/styles';
import '@/registerServiceWorker';
import Vue from 'vue';
import devtools from '@vue/devtools';
import { Component } from 'vue-property-decorator';
import { createLogger } from '@/stores/logger';
import { rootConfig } from '@/mainvue';


Vue.use(devtools);

const logger = createLogger('Main');
const inDev = process.env.NODE_ENV === 'development';

if (inDev) {
  devtools.connect();
}

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
