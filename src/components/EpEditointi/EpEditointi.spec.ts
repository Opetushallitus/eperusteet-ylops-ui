import { mount, createLocalVue } from '@vue/test-utils';
import EpEditointi from './EpEditointi.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { KieliStore } from '@shared/stores/kieli';

import '@/config/bootstrap';
import '@/config/fontawesome';

describe('EpEditointi component', () => {
  const localVue = createLocalVue();
  KieliStore.setup(localVue);
  const i18n = KieliStore.setup(localVue);

  test('Renders header and content', async () => {
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
    } as any, {
      localVue,
      mocks: {
        $t: x => x,
      },
    } as any);

    await localVue.nextTick();
    await localVue.nextTick();
    await localVue.nextTick();

    expect(wrapper.html()).toContain('<pre>foo</pre>');
  });
});
