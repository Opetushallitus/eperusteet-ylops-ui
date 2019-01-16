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
      });
});
