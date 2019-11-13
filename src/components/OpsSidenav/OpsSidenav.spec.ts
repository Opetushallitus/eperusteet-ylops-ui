import { mount, createLocalVue } from '@vue/test-utils';
import OpsSidenav from './OpsSidenav.vue';

import { router } from '@/router';
import { PerusteCache } from '@/stores/peruste';
import { KieliStore } from '@shared/stores/kieli';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

import { Opetussuunnitelmat, OpetussuunnitelmanSisalto, Termisto } from '@/api';
import { makeAxiosResponse } from '&/utils/data';


describe('OpsSidenav component', async () => {
  const localVue = createLocalVue();
  KieliStore.setup(localVue);
  const i18n = KieliStore.i18n;

  jest.spyOn(Termisto, 'getAllTermit')
    .mockImplementation(async (id: number) => {
      return makeAxiosResponse([{
      }]);
    });

  jest.spyOn(OpetussuunnitelmanSisalto, 'getTekstiOtsikot')
    .mockImplementation(async (id: number) => {
      return makeAxiosResponse({
        id: id,
        nimi: {
          fi: 'Ops',
        } as any,
      });
    });

  jest.spyOn(Opetussuunnitelmat, 'getOpetussuunnitelma')
    .mockImplementation(async (id: number) => {
      return makeAxiosResponse({
        id: id,
        nimi: {
          fi: 'Ops',
        } as any,
      });
    });

  test('navigates the menu structure properly', () => {
    jest.spyOn(PerusteCache, 'of')
      .mockImplementation(async () => new PerusteCache(1));

    const wrapper = mount(OpsSidenav as any, {
      localVue,
      router,
      i18n,
      propsData: {
        opetussuunnitelmaStore: new OpetussuunnitelmaStore(1),
      },
      stubs: ['fas'],
      mocks: {
        $t: x => x,
      },
    } as any);

    expect(wrapper.html()).toContain('oph-spinner');
  });
});
