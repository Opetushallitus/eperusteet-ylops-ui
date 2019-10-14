import { shallowMount, createLocalVue } from '@vue/test-utils';
import OpsSidenavLink from './OpsSidenavLink.vue';
import VueRouter from 'vue-router';
import { KieliStore } from '@shared/stores/kieli';


describe('OpsSidenav component', () => {
  const localVue = createLocalVue();
  KieliStore.setup(localVue);

  it('shows a element with currect href', () => {
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
