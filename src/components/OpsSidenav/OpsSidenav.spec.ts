import { mount, createLocalVue } from '@vue/test-utils';
import OpsSidenav from './OpsSidenav.vue';

import { router } from '@/router';
import { PerusteCache } from '@/stores/peruste';
import { KieliStore } from '@shared/stores/kieli';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';


describe('OpsSidenav component', async () => {
  const localVue = createLocalVue();
  KieliStore.setup(localVue);
  const i18n = KieliStore.i18n;

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

    expect(wrapper.html()).toContain('search');
  });
});
