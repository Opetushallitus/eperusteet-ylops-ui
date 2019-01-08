import { shallowMount } from '@vue/test-utils';
import CKEditor from './component.vue';

describe('ckeditor component', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message';
    const wrapper = shallowMount(CKEditor, {
      propsData: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
