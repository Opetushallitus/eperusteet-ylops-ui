import { createLocalVue, mount } from '@vue/test-utils';
import EpKaanna from './EpKaanna.vue';
import { i18n, Kielet } from '@/stores/kieli';
import { Kieli } from '@/tyypit';

import '@/config/bootstrap';

describe('EpKaanna component', () => {
  const localVue = createLocalVue();

  beforeEach(() => {
    Kielet.setUiKieli(Kieli.fi);
  });

  it('Renders content', () => {
    let wrapper = mount(EpKaanna, {
      propsData: {
        value: {
          _id: 1,
          fi: 'fi',
          sv: 'sv'
        },
      },
      i18n,
      localVue,
    });
    expect(wrapper.html()).toContain('fi');
  });

  it('Renders available content', () => {
    let wrapper = mount(EpKaanna, {
      propsData: {
        value: {
          _id: 2,
          sv: 'sv',
          en: 'en'
        },
      },
      i18n,
      localVue,
    });
    expect(wrapper.html()).toContain('en');
    expect(wrapper.findAll('button').length).toEqual(2);

    wrapper.find('button').trigger('click');

    expect(wrapper.html()).toContain('sv');
  });
});
