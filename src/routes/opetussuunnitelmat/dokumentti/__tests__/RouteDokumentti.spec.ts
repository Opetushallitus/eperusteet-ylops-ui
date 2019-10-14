import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import RouteDokumentti from '../RouteDokumentti.vue';
import { OpetussuunnitelmaStore  } from '@/stores/opetussuunnitelma';
import { KieliStore } from '@shared/stores/kieli';
import _ from 'lodash';
import { Dokumentit, Opetussuunnitelmat } from '@/api';

import '@/config/bootstrap';
import '@/config/fontawesome';


describe('RouteDokumentti', async () => {
  const localVue = createLocalVue();
  KieliStore.setup(localVue, {
    messages: {
      fi: require('@/translations/locale-fi.json'),
      sv: require('@/translations/locale-sv.json'),
    },
  });
  const i18n = KieliStore.i18n;
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


