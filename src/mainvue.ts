import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import VueScrollTo from 'vue-scrollto';

import Loading from 'vue-loading-overlay';
import Notifications from 'vue-notification';
import PortalVue from 'portal-vue';

import '@shared/config/bootstrap';
import '@shared/config/fontawesome';

import { router } from '@/router';
import { Kielet } from '@shared/stores/kieli';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import Kaannos from '@shared/plugins/kaannos';
import VueI18n, { IVueI18n } from 'vue-i18n';
import { Notifikaatiot } from '@shared/plugins/notifikaatiot';

import App from '@/App.vue';
import aikaleima from '@shared/plugins/aikaleima';
import plaintext from '@shared/plugins/plaintext';
import Vuelidate from 'vuelidate';

Vue.use(VueCompositionApi);
Vue.use(VueI18n);
Vue.use(VueScrollTo);
Vue.use(Notifications);
Vue.use(Kaannos);
Vue.use(aikaleima);
Vue.use(plaintext);
Vue.use(Notifikaatiot);
Vue.use(Vuelidate);
Vue.directive('oikeustarkastelu', oikeustarkastelu);
Vue.use(PortalVue);

Vue.use(Loading, {
  fullPage: true,
  color: '#159ecb',
  loader: 'dots',
});

Vue.use(Kielet, {
  messages: {
    fi: {
      ...require('@shared/translations/locale-fi.json'),
      ...require('@/translations/locale-fi.json'),
    },
    sv: {
      ...require('@shared/translations/locale-sv.json'),
      ...require('@/translations/locale-sv.json'),
    },
  },
});

export async function getRootConfig() {
  return {
    i18n: Kielet.i18n,
    router,
    render: (h: any) => h(App),
  };
}
