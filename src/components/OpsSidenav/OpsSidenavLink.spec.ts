import { shallowMount, createLocalVue } from '@vue/test-utils';
import OpsSidenavLink from './OpsSidenavLink.vue';
import VueRouter from 'vue-router';
import { KieliStore, Kielet } from '@shared/stores/kieli';
import VueI18n from 'vue-i18n';
import { Kaannos } from '@shared/plugins/kaannos';

describe('OpsSidenav component', () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  Kielet.install(localVue);
  localVue.use(new Kaannos());

  it('shows a element with currect href', () => {
    localVue.use(VueRouter);
    const router = new VueRouter({
      routes: [{
        path: '/tiedot',
        name: 'opsTiedot',
      }],
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
