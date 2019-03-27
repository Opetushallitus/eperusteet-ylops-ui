import { mount } from '@vue/test-utils';
import EpRecursiveNav from './EpRecursiveNav.vue';

const testData = [
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
];

describe('EpRecursiveNav component', () => {
  it('navigates the menu structure properly', () => {
    (testData[1].children[0] as any).parent = testData[1];

    const wrapper = mount(EpRecursiveNav, {
      propsData: {
        value: testData,
      },
      scopedSlots: {
        previousLink: '<div id="prevlink" @click="props.navigate()">{{props.itemData.item.name}}</div>',
        default: '<div v-if="!props.isSubmenu">{{props.itemData.item.name}}</div>'
          + '<div v-else @click="props.navigate(props.itemData)" id="sublink">{{props.itemData.item.name}}</div>',
      },
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
});
