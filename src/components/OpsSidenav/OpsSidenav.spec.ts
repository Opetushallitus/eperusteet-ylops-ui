import { mount, createLocalVue } from '@vue/test-utils';
import OpsSidenav from './OpsSidenav.vue';
import VueRouter from 'vue-router';

describe('OpsSidenav component', () => {
  it('navigates the menu structure properly', () => {
    const localVue = createLocalVue();
    localVue.use(VueRouter);
    const router = new VueRouter();

    const wrapper = mount(OpsSidenav, {
      localVue,
      router,
      stubs: ['fas'],
    });

    expect(wrapper.html()).toContain('search');
  });
});
