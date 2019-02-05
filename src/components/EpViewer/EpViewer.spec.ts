import { mount } from '@vue/test-utils';
import EpViewer from './EpViewer.vue';

describe('EpViewer component', () => {
    it('Renders given content', () => {
        const wrapper = mount(EpViewer, {
            propsData: {
                value: '<p>Test</p>',
            },
        });

        expect(wrapper.html()).toContain('Test');

        wrapper.setProps({
            value: '<p><span class="math-tex">x=2</span></p>'
        });

        expect(wrapper.html()).toContain('mathdefault');
      });
});
