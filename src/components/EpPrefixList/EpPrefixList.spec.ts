import { mount } from '@vue/test-utils';
import EpPrefixList from './EpPrefixList.vue';
import { mocks } from '@shared/utils/jestutils';

describe('EpPrefixList', () => {
  it('Read-only', () => {
    const wrapper = mount(EpPrefixList, {
      mocks: {
        ...mocks,
      },
      propsData: {
        value: {
          kohde: {
            fi: 'kohde',
          },
          arvot: [{
            fi: 'arvo 1',
          }, {
            fi: 'arvo 2',
          }],
        },
      },
    });
    expect(wrapper.html()).toContain('kohde');
    expect(wrapper.html()).toContain('arvo 1');
    expect(wrapper.html()).toContain('arvo 2');
  });
});
