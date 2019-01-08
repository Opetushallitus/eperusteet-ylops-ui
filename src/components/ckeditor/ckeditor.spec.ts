import { shallowMount } from '@vue/test-utils';
import CKEditor from './component.vue';

describe('ckeditor component', () => {
  it('renders editor with given content', () => {
    const value = 'Test';

    const wrapper = shallowMount(CKEditor, {
      propsData: { value },
    });

    expect(wrapper.html()).toContain('Test');
  });
});
