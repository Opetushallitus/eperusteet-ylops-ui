import { mount } from '@vue/test-utils';
import OpsSidenav from './OpsSidenav.vue';

describe('OpsSidenav component', () => {
  it('navigates the menu structure properly', () => {
    const wrapper = mount(OpsSidenav, {
      stubs: ['fas'],
    });

    expect(wrapper.html()).toContain('search');
  });
});
