import { mount } from '@vue/test-utils';
import EpRecursiveNav from './EpRecursiveNav.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { h, nextTick } from 'vue';

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
              },
            },
          ],
        },
      ],
    },
  ],
};

const testRoutes = [{
  path: '/:lang',
  component: { template: '<div><router-view /></div>' },
  children: [{
    path: 'opetussuunnitelmat/:id',
    name: 'opetussuunnitelma',
    component: { template: '<div><router-view /></div>' },
    children: [{
      path: 'tiedot',
      name: 'opsTiedot',
      component: { template: '<div>Tiedot</div>' },
    }, {
      path: 'alivalikko',
      name: 'alivalikko',
      component: { template: '<div>Alivalikko</div>' },
    }],
  }],
}];

const scopedSlots = {
  previousLink: (props: any) => h('div', {
    id: 'prevlink',
    onClick: () => props.navigate(),
  }, props.itemData.item.name),
  default: (props: any) => {
    if (!props.isSubmenu) {
      return h('div', props.itemData.item.name);
    }
    else {
      return h('div', {
        id: 'sublink',
        onClick: () => props.navigate(props.itemData),
      }, props.itemData.item.name);
    }
  },
};

describe('EpRecursiveNav component', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: testRoutes,
  });

  it('navigates the menu structure properly', async () => {
    await router.push({ name: 'opsTiedot', params: { lang: 'fi', id: '123' } });

    const wrapper = mount(EpRecursiveNav, {
      global: {
        plugins: [router],
      },
      props: propsData,
      slots: scopedSlots,
    });

    await nextTick();

    expect(wrapper.html()).toContain('Dokumentit');
    expect(wrapper.html()).not.toContain('prevlink');

    // Trigger 'vaihdaValikkoa' method
    await wrapper.find('#sublink').trigger('click');
    expect(wrapper.html()).toContain('Toinen taso');
    expect(wrapper.html()).toContain('prevlink');

    await wrapper.find('#sublink').trigger('click');
    expect(wrapper.html()).toContain('testi');
    expect(wrapper.html()).toContain('prevlink');
    expect(wrapper.html()).not.toContain('Alivalikko');

    // Trigger 'palaaTakaisin' method twice. We should end at starting point
    await wrapper.find('#prevlink').trigger('click');
    expect(wrapper.html()).toContain('Alivalikko');

    await wrapper.find('#prevlink').trigger('click');
    expect(wrapper.html()).toContain('Dokumentit');
    expect(wrapper.html()).not.toContain('prevlink');
  });

  it('goes to proper menulevel depending on route', async () => {
    // opsTiedot is flattened, so we should end up in top level
    await router.replace({
      name: 'opsTiedot',
      params: {
        'lang': 'fi',
        'id': '123',
      },
    });
    const wrapper1 = mount(EpRecursiveNav, {
      global: {
        plugins: [router],
      },
      props: propsData,
      slots: scopedSlots,
    });
    await nextTick();
    expect(wrapper1.html()).toContain('Alivalikko');

    // alivalikko is not flattened, so we should end up in it's children
    await router.replace({
      name: 'alivalikko',
      params: {
        'lang': 'fi',
        'id': '123',
      },
    });
    const wrapper2 = mount(EpRecursiveNav, {
      global: {
        plugins: [router],
      },
      props: propsData,
      slots: scopedSlots,
    });
    await nextTick();
    expect(wrapper2.html()).toContain('Toinen taso');
  });
});
