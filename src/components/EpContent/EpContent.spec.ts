import { mount } from '@vue/test-utils';
import EpContent from './EpContent.vue';

describe('EpContent component', () => {
    it('Renders given string content', () => {
        const wrapper = mount(EpContent, {
            propsData: {
                value: '<p>Non editable</p>',
                isEditable: false,
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

    it('does not render test message', () => {
        const wrapper = mount(EpContent, {
            propsData: {
                value: {
                    foo: 'TestMsg',
                },
            },
        });

        expect(wrapper.text()).toEqual('');
    });

});
