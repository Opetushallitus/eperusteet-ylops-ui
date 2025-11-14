import { mount } from '@vue/test-utils';
import EpPrefixList from './EpPrefixList.vue';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { Kielet } from '@shared/stores/kieli';
import { Kieli } from '@shared/tyypit';

describe('EpPrefixList', () => {
  beforeEach(() => {
    // Ensure the language is set to Finnish for tests
    Kielet.setSisaltoKieli(Kieli.fi);
  });

  it('Read-only', () => {
    const wrapper = mount(EpPrefixList, {
      global: {
        ...globalStubs,
      },
      props: {
        modelValue: {
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
