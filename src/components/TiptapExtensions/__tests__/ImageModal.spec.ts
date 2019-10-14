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

    test('Readonly and editable modes', async () => {
      const extension = new ImageExtension(13);
      const wrapper = mount(extension.view as any, {
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
        mocks: {
          $t: x => x,
        },
      } as any);

      wrapper.setProps({
        view: {
          editable: true,
        },
      });

      await localVue.nextTick();
      console.log(wrapper.html());
      const img = wrapper.find('img');
      expect(img).toBeTruthy();
      expect(img.attributes()['data-uid']).toEqual('1234');
      expect(img.attributes()['src']).toEqual('/eperusteet-ylops-service/api/opetussuunnitelmat/13/kuvat/1234');
    });

  });

  test('Mounting', async () => {
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
