import { mount, shallowMount } from '@vue/test-utils';
import Collapse from './component.vue';
import '@/config/bootstrap';
import '@/config/fontawesome';

describe('Collapse component', () => {
  const options = {
    slots: {
      header: '<h3>Hello world</h3>',
      content: '<b>Foobar</b>',
    },
  };

  it('Renders header and content', () => {
    const wrapper = mount(Collapse, options);
    expect(wrapper.html()).toContain(options.slots.header);
    expect(wrapper.html()).toContain(options.slots.content);
  });

  it('Renders header and content', () => {
    const wrapper = mount(Collapse, options);
    wrapper.find('button.btn').trigger('click');
    expect(wrapper.html()).toContain(options.slots.header);
    expect(wrapper.html()).not.toContain(options.slots.content);
  });
});
