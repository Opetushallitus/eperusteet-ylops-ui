import Vue from 'vue';
import Loading from 'vue-loading-overlay';
import { VueMasonryPlugin } from 'vue-masonry';

Vue.use(VueMasonryPlugin);
Vue.use(Loading, {
  fullPage: true,
  color: '#159ecb',
  loader: 'dots',
});

import '@/config/bootstrap';
import '@/config/fontawesome';

import { router } from '@/router';
import { i18n } from '@/stores/kieli';
import { Virheet } from '@/stores/virheet';

import App from '@/App.vue';

function errorCaptured(err: Error, vm: Vue, info: string) {
  console.error(err, info);
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
