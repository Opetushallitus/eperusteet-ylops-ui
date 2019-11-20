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
  const config = {
    messages: {
      fi: require('@/translations/locale-fi.json'),
      sv: require('@/translations/locale-sv.json'),
    },
  };
  KieliStore.setup(Vue, config);
  await KieliStore.load(getLokalisoinnit);

  return {
    i18n: KieliStore.i18n,
    router,
    render: (h: any) => h(App),
  };
}
