import { createLocalVue, shallowMount } from '@vue/test-utils';
import EpKaanna from './EpKaanna.vue';
import { KieliStore, Kielet } from '@shared/stores/kieli';
import { Kieli } from '@/tyypit';

import '@/config/bootstrap';

describe('EpKaanna component', () => {
  const localVue = createLocalVue();
  KieliStore.setup(localVue);
  const i18n = KieliStore.setup(localVue);

  beforeEach(() => {
    Kielet.setUiKieli(Kieli.fi);
  });

  it('Renders content', () => {
    let wrapper = shallowMount(EpKaanna as any, {
      propsData: {
        value: {
          _id: 1,
          fi: 'fi',
          sv: 'sv'
        },
      },
      i18n,
      localVue,
    } as any);
    expect(wrapper.html()).toContain('fi');
  });

  it('Renders available content', () => {
    let wrapper = shallowMount(EpKaanna as any, {
      propsData: {
        value: {
          _id: 2,
          sv: 'sv',
          en: 'en'
        },
      },
      i18n,
      localVue,
    } as any);
    expect(wrapper.html()).toContain('en');
    expect(wrapper.findAll('button').length).toEqual(2);

    wrapper.find('button').trigger('click');

    expect(wrapper.html()).toContain('sv');
  });
});
