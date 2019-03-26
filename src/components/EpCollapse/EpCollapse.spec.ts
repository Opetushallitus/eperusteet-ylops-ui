import { mount, shallowMount } from '@vue/test-utils';
import EpCollapse from './EpCollapse.vue';
import '@/config/bootstrap';
import '@/config/fontawesome';

describe('EpCollapse component', () => {
  const options = {
    slots: {
      header: '<h3>Hello world</h3>',
      default: '<b>Foobar</b>',
    },
  };

  it('Renders header and content', () => {
    const wrapper = mount(EpCollapse, options);
    expect(wrapper.html()).toContain(options.slots.header);
    expect(wrapper.html()).toContain(options.slots.default);
  });

  it('Renders header only when collapsed', () => {
    const wrapper = mount(EpCollapse, options);
    wrapper.find('.collapse-button').trigger('click');
    expect(wrapper.html()).toContain(options.slots.header);
    expect(wrapper.html()).not.toContain(options.slots.default);
  });
});
