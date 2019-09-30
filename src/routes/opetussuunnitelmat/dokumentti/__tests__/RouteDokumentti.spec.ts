import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import RouteDokumentti from '../RouteDokumentti.vue';
import { OpetussuunnitelmaStore  } from '@/stores/opetussuunnitelma';
import { i18n } from '@/stores/kieli';
import _ from 'lodash';
import { Dokumentit, Opetussuunnitelmat } from '@/api';
import { } from '@/api';

import '@/config/bootstrap';
import '@/config/fontawesome';


describe('RouteDokumentti', async () => {
  const localVue = createLocalVue();
  OpetussuunnitelmaStore.prototype.init = jest.fn();
  Dokumentit.getDokumenttiId = jest.fn();
  const opetussuunnitelmaStore = new OpetussuunnitelmaStore(42);
  opetussuunnitelmaStore.opetussuunnitelma = {
    id: 42,
    nimi: {
      fi: 'nimi',
    } as any,
  };
  const wrapper = mount(RouteDokumentti, {
    i18n,
    localVue,
    propsData: {
      opetussuunnitelmaStore,
    },
  });

  test('', async () => {
  });
});


