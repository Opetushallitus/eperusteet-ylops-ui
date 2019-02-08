import { mount } from '@vue/test-utils';
import EpViewer from './EpViewer.vue';

describe('EpViewer component', () => {
    it('Renders given content', ( done ) => {
        // Simple html test
        let wrapper = mount(EpViewer, {
            propsData: {
                value: '<p>Test</p>',
            },
        });
        expect(wrapper.html()).toContain('Test');

        // Should not call katex render
        wrapper = mount(EpViewer, {
            propsData: {
                value: '<p><span class="math-tex"></span></p>',
            },
        });
        expect(wrapper.html()).not.toContain('mathdefault');

        // Should call updated method & katex render
        wrapper.setProps({
            value: '<p><span class="math-tex">x=2</span></p>'
        });

        // Note, updated method has 150ms debounce value, so this test
        // fails without timeout
        setTimeout( () => {
            expect(wrapper.html()).toContain('mathdefault');
            done();
        },300);
      });
});
