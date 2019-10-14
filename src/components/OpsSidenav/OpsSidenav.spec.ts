import { mount, createLocalVue } from '@vue/test-utils';
import OpsSidenav from './OpsSidenav.vue';

import { router } from '@/router';
import { PerusteCache } from '@/stores/peruste';
import { KieliStore } from '@shared/stores/kieli';


describe.skip('OpsSidenav component', async () => {
  const localVue = createLocalVue();
  await KieliStore.setup(localVue);
  const i18n = KieliStore.i18n;

  it('navigates the menu structure properly', () => {
    jest.spyOn(PerusteCache, 'of')
      .mockImplementation(async () => new PerusteCache(1));
    const wrapper = mount(OpsSidenav as any, {
      localVue,
      router,
      i18n,
      stubs: ['fas'],
    } as any);
    expect(wrapper.html()).toContain('search');
  });
});
