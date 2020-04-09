import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import RouteDokumentti from '../RouteDokumentti.vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { KieliStore, Kielet } from '@shared/stores/kieli';
import _ from 'lodash';
import { Dokumentit, Opetussuunnitelmat } from '@shared/api/ylops';

import '@/config/bootstrap';
import '@/config/fontawesome';
import VueI18n from 'vue-i18n';
import { Kaannos } from '@shared/plugins/kaannos';

describe('RouteDokumentti', async () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  Kielet.install(localVue, {
    messages: {
      fi: require('@/translations/locale-fi.json'),
      sv: require('@/translations/locale-sv.json'),
    },
  });
  localVue.use(new Kaannos());

  const i18n = Kielet.i18n;
  OpetussuunnitelmaStore.prototype.init = jest.fn();
  Dokumentit.getDokumenttiId = jest.fn();
  const opetussuunnitelmaStore = new OpetussuunnitelmaStore(42);

  test('mounting', async () => {
    const wrapper = mount(RouteDokumentti as any, {
      i18n,
      localVue,
      propsData: {
        opetussuunnitelmaStore,
      },
    } as any);

    opetussuunnitelmaStore.opetussuunnitelma = {
      id: 42,
      nimi: {
        fi: 'nimi',
      } as any,
    };

    await localVue.nextTick();
  });
});
