import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { makeAxiosResponse } from '&/utils/data';
import { shallowMount, mount, createLocalVue } from '@vue/test-utils';
import RouteUkk from '../RouteUkk.vue';
import { KieliStore } from '@shared/stores/kieli';
const i18n = KieliStore.i18n;

import _ from 'lodash';
import { Ulkopuoliset, Kysymykset } from '@/api';
import { KysymysDto } from '@/tyypit';

import '@/config/bootstrap';
import '@/config/fontawesome';


describe('RouteUkk', async () => {
  const localVue = createLocalVue();
  await KieliStore.setup(localVue);
  const i18n = KieliStore.i18n;

  jest.spyOn(Ulkopuoliset, 'getUserOrganisations')
    .mockImplementation(async () => makeAxiosResponse([{
      oid: '123',
    }]));

  jest.spyOn(Kysymykset, 'createKysymys')
    .mockImplementation(async (x: any) => makeAxiosResponse(x));

  jest.spyOn(Kysymykset, 'updateKysymys')
    .mockImplementation(async (x: any) => makeAxiosResponse(x));

  jest.spyOn(Kysymykset, 'deleteKysymys')
    .mockImplementation(async (x: any) => makeAxiosResponse(null as any));

  jest.spyOn(Kysymykset, 'getKysymykset')
    .mockImplementation(async () => makeAxiosResponse([{
      id: 1,
      kysymys: { fi: 'kysymys' },
      vastaus: { fi: 'vastaus' },
      organisaatiot: [{
        oid: '123',
      }],
    }] as any));

  const wrapper = mount(RouteUkk as any, {
    i18n,
    localVue,
    stubs: ['EpSelect', 'EpNavigation'],
  } as any);

  test('Rendering', async () => {
    await localVue.nextTick();
    await localVue.nextTick();
    expect(wrapper.html()).toContain('kysymys');
    expect(wrapper.html()).toContain('vastaus');
  });

});
