import { mount } from '@vue/test-utils';
import EpContentBase from './EpContentBase.vue';

describe('EpContentBase component', () => {
    it('Renders given content', () => {
        const wrapper = mount(EpContentBase, {
            propsData: {
                value: '<p>Non editable</p>',
                isEditable: false,
            },
        });

        expect(wrapper.html()).toContain('Non editable');
      });
});
