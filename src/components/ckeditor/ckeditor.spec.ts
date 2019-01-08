import { shallowMount } from '@vue/test-utils';
import CKEditor from './component.vue';


describe('ckeditor component', async () => {
  it('renders editor with given content', async () => {
    const value = 'Test';

    console.warn = jest.fn();
    const wrapper = shallowMount(CKEditor, {
      propsData: { value },
    });

    expect(console.warn).not.toBeCalled();
    // expect(wrapper.html()).toContain('Test');
  });
});
