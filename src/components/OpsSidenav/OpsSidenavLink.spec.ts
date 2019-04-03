import { shallowMount, createLocalVue } from '@vue/test-utils';
import OpsSidenavLink from './OpsSidenavLink.vue';
import VueRouter from 'vue-router';

describe('OpsSidenav component', () => {
  it('shows a element with currect href', () => {
    const localVue = createLocalVue();
    localVue.use(VueRouter);
    const router = new VueRouter({
      routes: [{
        path: '/tiedot',
        name: 'opsTiedot',
      }]
    });

    const wrapper = shallowMount(OpsSidenavLink, {
      localVue,
      router,
      slots: {
        default: '<a>Linkki</a>',
      },
      propsData: {
        to: {
          name: 'opsTiedot',
        },
      },
    });

    expect(wrapper.html()).toContain('tiedot');
  });
});
