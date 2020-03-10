import { mount, createLocalVue } from '@vue/test-utils';
import EpEditointi from './EpEditointi.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { KieliStore, Kielet } from '@shared/stores/kieli';

import '@/config/bootstrap';
import '@/config/fontawesome';
import VueI18n from 'vue-i18n';
import { Kaannos } from '@shared/plugins/kaannos';

describe('EpEditointi component', () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  Kielet.install(localVue);
  localVue.use(new Kaannos());

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
