import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { mount, createLocalVue } from '@vue/test-utils';
import ImageExtension from '../ImageExtension';
import ImageModal from '../ImageModal.vue';
import { KieliStore } from '@shared/stores/kieli';
import { IAttachmentWrapper } from '@/stores/kuvat';

import '@/config/bootstrap';
import '@/config/fontawesome';


describe('Tiptap Image Extension', () => {
  const localVue = createLocalVue();
  KieliStore.setup(localVue);
  const i18n = KieliStore.setup(localVue);

  test('Prose mirror extension', async () => {
    const extension = new ImageExtension(13);
    expect(extension.name).toBe('image');
    expect(extension.extensions).toEqual([]);
    expect(extension.schema.attrs['data-uid']).toBeTruthy();
  });

  describe('Mounted extension component', async () => {
    const extension = new ImageExtension(13);
    const wrapper = mount(extension.view as any, {
      i18n,
      localVue,
      propsData: {
        view: {
          editable: false,
        },
        node: {
          attrs: {
            'data-uid': '1234',
          },
        },
      },
    } as any);

    test('Readonly and editable modes', async () => {
      await localVue.nextTick();
      expect(wrapper.vm.$refs.kuvanLisaysPopover).toBeFalsy();

      wrapper.setProps({
        view: {
          editable: true,
        },
      });
      await localVue.nextTick();
      expect(wrapper.vm.$refs.kuvanLisaysPopover).toBeTruthy();
    });

    test('Contains right data', async () => {
      const img = wrapper.find('#' + (wrapper.vm as any).id);
      expect(img).toBeTruthy();
      expect(img.attributes()['data-uid']).toEqual('1234');
      expect(img.attributes()['src']).toEqual('/eperusteet-ylops-service/api/opetussuunnitelmat/13/kuvat/1234');
    });

  });

  describe('Image modal', async () => {
    const loader: IAttachmentWrapper = {
      async hae() {
        return [];
      },
      url(id: string) {
        return 'endpoint/' + id;
      },
      endpoint() {
        return 'endpoint/';
      },
    };

    const wrapper = mount(ImageModal as any, {
      propsData: {
        value: '1234',
        loader,
      },
      i18n,
      localVue,
    } as any);
  });
});
