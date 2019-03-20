import { mount } from '@vue/test-utils';
import EpContent from './EpContent.vue';

describe('EpContent component', () => {
  it('Renders given string content', async () => {
    const wrapper = mount(EpContent, {
      propsData: {
        value: '<p>Non editable</p>',
        isEditable: false,
        lokalisoitu: false,
      },
    });

    expect(wrapper.html()).toContain('Non editable');
  });

  it('Renders given object content', () => {
    const wrapper = mount(EpContent, {
      propsData: {
        value: {
          fi: 'TestMsg',
        },
      },
    });

    expect(wrapper.html()).toContain('TestMsg');
  });

  it('does not render anything with null value', () => {
    const wrapper = mount(EpContent, {
      propsData: {
        value: null,
      },
    });
    expect(wrapper.text()).toEqual('');
  });
});
