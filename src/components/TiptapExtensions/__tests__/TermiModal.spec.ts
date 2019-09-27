import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import Vuelidate from 'vuelidate';
import TermiExtension from '../TermiExtension';
import TermiEditor from '../TermiEditor.vue';
import { i18n } from '@/stores/kieli';
import { IKasiteHandler } from '@/stores/kuvat';
import { TermiDto } from '@/tyypit';
import { Termisto } from '@/api';

import { makeAxiosResponse } from '&/utils/data';

import '@/config/bootstrap';
import '@/config/fontawesome';


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
  const kasitteetHandler = mockKasitteet();

  test('Prose mirror extension', async () => {
    const extension = new TermiExtension(kasitteetHandler);
    expect(extension.name).toBe('termi');
    expect(extension.extensions).toEqual([]);
    expect(extension.schema.attrs['data-viite']).toBeTruthy();
  });

  describe('Mounted extension component', async () => {
    const extension = new TermiExtension(kasitteetHandler);
    const wrapper = shallowMount(extension.view, {
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
    });

    test('Readonly and editable modes', async () => {
      await localVue.nextTick();
      expect(wrapper.attributes()['data-viite']).toEqual('1234');
    });

  });

  describe('Termi modal', async () => {
    const handler = mockKasitteet();
    const wrapper = mount(TermiEditor, {
      propsData: {
        value: '1234',
        handler,
      },
      i18n,
      localVue,
    });
    await localVue.nextTick();
  });

});

