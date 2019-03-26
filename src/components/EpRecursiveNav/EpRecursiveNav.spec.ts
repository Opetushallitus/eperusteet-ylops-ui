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
  },
];

describe('EpRecursiveNav component', () => {
  it('Renders header and content', () => {
    const wrapper = mount(EpRecursiveNav, {
      propsData: {
        value: testData,
      },
      scopedSlots: {
        default: '<div>{{props.item.name}}</div>',
      },
    });

    expect(wrapper.html()).toContain('Dokumentit');
  });
});
