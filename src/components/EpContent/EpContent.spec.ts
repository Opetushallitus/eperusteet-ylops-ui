import { mount } from '@vue/test-utils';
import EpContent from './EpContent.vue';

describe('EpContent component', () => {
    it('Renders given content', () => {
        const wrapper = mount(EpContent, {
            propsData: {
                value: '<p>Non editable</p>',
                isEditable: false,
            }
        });

        expect(wrapper.html()).toContain('Non editable');
      });
});
