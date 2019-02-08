import { mount, shallowMount } from '@vue/test-utils';
import EpButton from './EpButton.vue';

describe('EpButton component', () => {
  const options = {
  };

  it('Renders button with content', () => {
    const wrapper = mount(EpButton, {
      slots: {
        content: 'Test',
      },
    });
    expect(wrapper.html()).toContain("Test");
  });

  it('Renders button with spinner', () => {
    const wrapper = mount(EpButton, {
      slots: {
        content: 'Test',
      },
      propsData: {
        showSpinner: true,
      },
    });
    expect(wrapper.html()).toContain("oph-spinner");
  });
});
