import App from './App.vue';
import '@shared/config/styles';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { setAppInstance, $confirmModal } from '@shared/utils/globals';
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
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { registerIconColorSchemeChange } from '@shared/utils/icon';
import TextClamp from 'vue3-text-clamp';
import { VuosiluokkaistaminenStore } from './stores/vuosiluokkaistaminenStore';
import { PerusopetusPaikallinenOppiaineStore } from './stores/perusopetusPaikallinenOppiaineStore';
import { VuosiluokkakokonaisuusStore } from './stores/vuosiluokkakokonaisuusStore';
import { stores } from './stores';
import { OpintojaksoStore } from './stores/opintojaksoStore';
import { PerusopetusoppiaineStore } from './stores/perusopetusoppiaineStore';
import { LopsPaikallinenOppiaineStore } from './stores/lopsPaikallinenOppiaineStore';
import { TekstikappaleStore } from './stores/TekstikappaleStore';
import { setPrimeVue } from '@shared/primevue';
import { vSticky } from '@shared/directives/vSticky';

const app = createApp(App);
app.directive('sticky', vSticky);

registerIconColorSchemeChange();

setAppInstance(app);
app.config.globalProperties.$confirmModal = $confirmModal;

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
setPrimeVue(app);
app.use(Kielet, { i18n });
app.use(Aikaleima);
app.use(LoadingPlugin);
app.use(createHead());
app.use(Oikeustarkastelu, { oikeusProvider: Kayttajat });
app.use(Notifikaatiot);
app.use(Plaintext);
app.use(TextClamp);

app.use(VueScrollTo, {
  duration: 1000,
});

app.use(EditointiStore, { router, kayttajaProvider: Kayttajat });
app.use(VuosiluokkaistaminenStore, { router });
app.use(PerusopetusPaikallinenOppiaineStore, { router, opetussuunnitelmaStore: stores.opetussuunnitelmaStore });
app.use(PerusopetusoppiaineStore, { router });
app.use(VuosiluokkakokonaisuusStore, { router });
app.use(OpintojaksoStore, { router });
app.use(LopsPaikallinenOppiaineStore, { router });
app.use(TekstikappaleStore, { router });

app.mount('#app');
