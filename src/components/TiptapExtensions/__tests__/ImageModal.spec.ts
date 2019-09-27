import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { mount, createLocalVue } from '@vue/test-utils';
import ImageExtension from '../ImageExtension';
import ImageModal from '../ImageModal.vue';
import { i18n } from '@/stores/kieli';
import { IAttachmentWrapper } from '@/stores/kuvat';

import '@/config/bootstrap';
import '@/config/fontawesome';


describe('Tiptap Image Extension', () => {
  const localVue = createLocalVue();

  test('Prose mirror extension', async () => {
    const extension = new ImageExtension(13);
    expect(extension.name).toBe('image');
    expect(extension.extensions).toEqual([]);
    expect(extension.schema.attrs['data-uid']).toBeTruthy();
  });

  describe('Mounted extension component', async () => {
    const extension = new ImageExtension(13);
    const wrapper = mount(extension.view, {
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
    });

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

    test('Contains right data', async () => {
      await wrapper.vm.open();
      await localVue.nextTick();
      await wrapper.vm.close();
      await localVue.nextTick();
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

    const wrapper = mount(ImageModal, {
      propsData: {
        value: '1234',
        loader,
      },
      i18n,
      localVue,
    });
  });
});
