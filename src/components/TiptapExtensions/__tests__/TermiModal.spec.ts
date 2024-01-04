import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import TermiExtension from '../TermiExtension';
import TermiEditor from '../TermiEditor.vue';
import { Kielet } from '@shared/stores/kieli';
import { IKasiteHandler } from '@/stores/kuvat';
import { TermiDto } from '@shared/api/ylops';
import '@shared/config/bootstrap';
import VueI18n from 'vue-i18n';
import { Kaannos } from '@shared/plugins/kaannos';

function mockKasitteet(): IKasiteHandler {
  return {
    async getAll() {
      return [];
    },
    async getOne(avain: string) {
      return {};
    },
    async addOrUpdate(termi: TermiDto): Promise<TermiDto> {
      return termi;
    },
  };
}

describe('Tiptap Termi Extension', () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  Kielet.install(localVue, {
    messages: {
      fi: require('@shared/translations/locale-fi.json'),
      sv: require('@shared/translations/locale-sv.json'),
    },
  });
  localVue.use(new Kaannos());

  const i18n = Kielet.i18n;

  const kasitteetHandler = mockKasitteet();

  test('Prose mirror extension', async () => {
    const extension = new TermiExtension(kasitteetHandler);
    expect(extension.name).toBe('termi');
    expect(extension.extensions).toEqual([]);
    expect(extension.schema.attrs['data-viite']).toBeTruthy();
  });

  describe('Mounted extension component', () => {
    const extension = new TermiExtension(kasitteetHandler);
    const wrapper = shallowMount(extension.view as any, {
      i18n,
      localVue,
      propsData: {
        view: {
          editable: false,
        },
        node: {
          attrs: {
            'data-viite': '1234',
          },
        },
      },
    } as any);

    test('Readonly and editable modes', async () => {
      await localVue.nextTick();
      expect(wrapper.attributes()['data-viite']).toEqual('1234');
    });
  });

  test('Termi modal', async () => {
    const handler = mockKasitteet();
    const wrapper = mount(TermiEditor as any, {
      propsData: {
        value: '1234',
        handler,
      },
      i18n,
      localVue,
    } as any);
    await localVue.nextTick();
  });
});
