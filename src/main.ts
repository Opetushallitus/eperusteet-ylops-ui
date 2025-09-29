import '@shared/config/bootstrap';
import '@shared/config/styles';
import { createPinia } from 'pinia';
import Vue, { createApp } from 'vue';
import { configureCompat } from 'vue';
import App from './App.vue';
import { setAppInstance } from '@shared/utils/globals';
import router from './router/router';
import Kaannos from '@shared/plugins/kaannos';
import Plaintext from '@shared/plugins/plaintext';
import { Kieli } from '@shared/tyypit';
import { createI18n } from 'vue-i18n';
import fiLocale from '@shared/translations/locale-fi.json';
import svLocale from '@shared/translations/locale-sv.json';
import enLocale from '@shared/translations/locale-en.json';
import { Kielet } from '@shared/stores/kieli';
import Aikaleima from '@shared/plugins/aikaleima';
import { LoadingPlugin } from 'vue-loading-overlay';
import { createHead } from '@unhead/vue/client';
import { Oikeustarkastelu } from '@shared/plugins/oikeustarkastelu';
import { Notifikaatiot } from '@shared/plugins/notifikaatiot';
import { Kayttajat } from './stores/kayttaja';
import VueScrollTo from 'vue-scrollto';
import VueApexCharts from 'vue-apexcharts';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import Sticky from 'vue-sticky-directive';
import { registerIconColorSchemeChange } from '@shared/utils/icon';
import TextClamp from 'vue3-text-clamp';
import { VuosiluokkaistaminenStore } from './stores/vuosiluokkaistaminenStore';
import { PerusopetusPaikallinenOppiaineStore } from './stores/perusopetusPaikallinenOppiaineStore';
import { VuosiluokkakokonaisuusStore } from './stores/vuosiluokkakokonaisuusStore';
import { OpetussuunnitelmaStore } from './stores/opetussuunnitelma';
import { stores } from './stores';
import { OpintojaksoStore } from './stores/opintojaksoStore';

const app = createApp(App);

registerIconColorSchemeChange();

configureCompat({
  COMPONENT_V_MODEL: false,
});

setAppInstance(app);

app.use(createPinia());
app.use(router);
app.use(Kaannos);

export const i18n = createI18n({
  legacy: false, // Set to false to use Composition API
  locale: Kieli.fi,
  fallbackLocale: Kieli.fi,
  messages: {
    fi: {
      ...fiLocale,
    },
    sv: {
      ...svLocale,
    },
    en: {
      ...enLocale,
    },
  },
});

app.use(i18n);
app.use(Kielet, { i18n });
app.use(Aikaleima);
app.use(LoadingPlugin);
app.use(createHead());
app.use(Oikeustarkastelu, { oikeusProvider: Kayttajat });
app.use(Notifikaatiot);
app.use(Plaintext);
app.use(TextClamp);

Vue.use(VueScrollTo, {
  duration: 1000,
});
Vue.use(VueApexCharts);
Vue.component('Apexchart', VueApexCharts);

app.use(EditointiStore, { router, kayttajaProvider: Kayttajat });
app.use(Sticky);

app.use(VuosiluokkaistaminenStore, { router });
app.use(PerusopetusPaikallinenOppiaineStore, { router, opetussuunnitelmaStore: stores.opetussuunnitelmaStore });
app.use(VuosiluokkakokonaisuusStore, { router });
app.use(OpintojaksoStore, { router });

app.mount('#app');
