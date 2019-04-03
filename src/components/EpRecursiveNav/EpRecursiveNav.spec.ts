import { shallowMount, createLocalVue } from '@vue/test-utils';
import EpRecursiveNav from './EpRecursiveNav.vue';
import VueRouter from 'vue-router';

const propsData = {
  value: [
    {
      item: {
        name: 'Tiedot',
      },
      route: {
        name: 'opsTiedot',
      },
      flatten: true,
      children: [
        {
          item: {
            name: 'Dokumentit',
          },
          route: {
            name: 'opsDokumentti',
          },
        }, {
          item: {
            name: 'Poistetut',
          },
          route: {
            name: 'opsPoistetut',
          },
        }, {
          item: {
            name: 'Käsitteet',
          },
          route: {
            name: 'opsKasitteet',
          },
        },
      ],
    }, {
      item: {
        name: 'Alivalikko',
      },
      route: {
        name: 'alivalikko',
      },
      children: [
        {
          item: {
            name: 'Toinen taso',
          },
          children: [
            {
              item: {
                name: 'testi',
              }
            },
          ],
        },
      ],
    }
  ],
};

const testRoutes = [{
  path: '/:lang',
  children: [{
    path: 'opetussuunnitelmat/:id',
    name: 'opetussuunnitelma',
    children: [{
      path: '/tiedot',
      name: 'opsTiedot',
    }, {
      path: '/alivalikko',
      name: 'alivalikko',
    }],
  }],
}];

const scopedSlots = {
  previousLink: '<div id="prevlink" @click="props.navigate()">{{props.itemData.item.name}}</div>',
  default: '<div v-if="!props.isSubmenu">{{props.itemData.item.name}}</div>'
    + '<div v-else @click="props.navigate(props.itemData)" id="sublink">{{props.itemData.item.name}}</div>',
};

describe('EpRecursiveNav component', () => {
  const localVue = createLocalVue();
  localVue.use(VueRouter);
  const router = new VueRouter({ routes: testRoutes });

  it('navigates the menu structure properly', () => {
    const wrapper = shallowMount(EpRecursiveNav, {
      localVue,
      router,
      propsData,
      scopedSlots,
    });

    expect(wrapper.html()).toContain('Dokumentit');
    expect(wrapper.html()).not.toContain('prevlink');

    // Trigger 'vaihdaValikkoa' method
    wrapper.find('#sublink').trigger('click');
    expect(wrapper.html()).toContain('Toinen taso');
    expect(wrapper.html()).toContain('prevlink');

    wrapper.find('#sublink').trigger('click');
    expect(wrapper.html()).toContain('testi');
    expect(wrapper.html()).toContain('prevlink');
    expect(wrapper.html()).not.toContain('Alivalikko');

    // Trigger 'palaaTakaisin' method twice. We should end at starting point
    wrapper.find('#prevlink').trigger('click');
    expect(wrapper.html()).toContain('Alivalikko');

    wrapper.find('#prevlink').trigger('click');
    expect(wrapper.html()).toContain('Dokumentit');
    expect(wrapper.html()).not.toContain('prevlink');
  });

  it('goes to proper menulevel depending on route', () => {
    // opsTiedot is flattened, so we should end up in top level
    router.replace({
      name: 'opsTiedot',
      params: {
        'lang': 'fi',
        'id': '123',
      },
    });
    const wrapper1 = shallowMount(EpRecursiveNav, {
      localVue,
      router,
      propsData,
      scopedSlots,
    });
    expect(wrapper1.html()).toContain('Alivalikko');

    // alivalikko is not flattened, so we should end up in it's children
    router.replace({
      name: 'alivalikko',
      params: {
        'lang': 'fi',
        'id': '123',
      },
    });
    const wrapper2 = shallowMount(EpRecursiveNav, {
      localVue,
      router,
      propsData,
      scopedSlots,
    });
    expect(wrapper2.html()).toContain('Toinen taso');
  });
});
