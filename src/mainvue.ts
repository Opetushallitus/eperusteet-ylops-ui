import Vue from 'vue';
import Loading from 'vue-loading-overlay';
import Notifications from 'vue-notification';

import '@/config/bootstrap';
import '@/config/fontawesome';

import { router } from '@/router';
import { KieliStore } from '@shared/stores/kieli';
import { Virheet } from '@/stores/virheet';
import { Ulkopuoliset } from '@/api';

import { createLogger } from '@/stores/logger';
import _ from 'lodash';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';

import App from '@/App.vue';
const logger = createLogger('main');

Vue.use(Notifications);
Vue.directive('oikeustarkastelu', oikeustarkastelu);

Vue.use(Loading, {
  fullPage: true,
  color: '#159ecb',
  loader: 'dots',
});

const isDevelopmentMode = () => _.get(process.env.NODE_ENV, '') === 'development';

function errorCaptured(err: Error, vm: Vue, info: string) {
  logger.error(err, info);
  if (!isDevelopmentMode()) {
    // Virheet.lisaaVirhe({
    //   path: vm.$route.path,
    //   state: _.cloneDeep(vm.$data),
    //   err: err.message,
    //   info,
    // });
  }
}

import VueI18n, { IVueI18n } from 'vue-i18n';

declare module 'vue/types/vue' {
  interface Vue {
    readonly $i18n: VueI18n & IVueI18n;
    $t: typeof VueI18n.prototype.t;
    $tc: typeof VueI18n.prototype.tc;
    $te: typeof VueI18n.prototype.te;
    $d: typeof VueI18n.prototype.d;
    $n: typeof VueI18n.prototype.n;
  }
}

async function getLokalisoinnit() {
  return (await Ulkopuoliset.getLokalisoinnit()).data as any;
}

export async function getRootConfig() {
  KieliStore.setup(Vue, {
    messages: {
      fi: require('@/translations/locale-fi.json'),
      sv: require('@/translations/locale-sv.json'),
    },
  });
  await KieliStore.load(getLokalisoinnit);

  return {
    i18n: KieliStore.i18n,
    router,
    render: (h: any) => h(App),
  };
}
