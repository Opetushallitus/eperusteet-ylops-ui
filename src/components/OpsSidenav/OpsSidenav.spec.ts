import { createLocalVue, mount } from '@vue/test-utils';
import OpsSidenav from './OpsSidenav.vue';
import { i18n } from '@/stores/kieli';
import { router } from '@/router';
import { PerusteCache } from '@/stores/peruste';

describe('OpsSidenav component', () => {
  it('navigates the menu structure properly', () => {
    jest.spyOn(PerusteCache, 'of')
      .mockImplementation(async () => new PerusteCache(1));

    const wrapper = mount(OpsSidenav, {
      router,
      i18n,
      stubs: ['fas'],
      localVue: createLocalVue()
    });

    expect(wrapper.html()).toContain('search');
  });
});
