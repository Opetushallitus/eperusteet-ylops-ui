import Vue from 'vue';
import Loading from 'vue-loading-overlay';

import '@/config/bootstrap';
import '@/config/fontawesome';

import { router } from '@/router';
import { i18n } from '@/stores/kieli';
import { Virheet } from '@/stores/virheet';

import { createLogger } from '@/stores/logger';

import App from '@/App.vue';
const logger = createLogger('main');

Vue.use(Loading, {
  fullPage: true,
  color: '#159ecb',
  loader: 'dots',
});

function errorCaptured(err: Error, vm: Vue, info: string) {
  logger.error(err, info);
  // Virheet.lisaaVirhe({
  //   path: vm.$route.path,
  //   state: _.cloneDeep(vm.$data),
  //   err: err.message,
  //   info,
  // });
}

export const rootConfig: any = {
  i18n,
  router,
  render: (h: any) => h(App),
  errorCaptured,
};
