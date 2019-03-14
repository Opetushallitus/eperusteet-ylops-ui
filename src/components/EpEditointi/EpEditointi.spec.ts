import Vue from 'vue';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import EpEditointi from './EpEditointi.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { rootConfig } from '@/mainvue';
import { i18n } from '@/stores/kieli';

import '@/config/bootstrap';
import '@/config/fontawesome';

describe('EpEditointi component', () => {
  const localVue = createLocalVue();

  it('Renders header and content', async () => {
    const editointi: EditointiKontrolliConfig = {
      source: {
        async load() {
          return {
            name: 'foo',
          };
        },
        async save() {
        },
      },
    };

    const wrapper = mount({
      components: {
        EpEditointi,
      },
      data() {
        return {
          hooks: editointi,
        };
      },
      template: `
      <div>
        <ep-editointi :hooks="hooks">
          <template slot-scope="scope">
            <pre>{{ scope.data.name }}</pre>
          </template>
        </ep-editointi>
      </div>
      `,
    }, {
      i18n,
      localVue,
    });

    // FIXME
    await localVue.nextTick();
    await localVue.nextTick();
    await localVue.nextTick();

    expect(wrapper.html()).toContain('<pre>foo</pre>');
  });
});
