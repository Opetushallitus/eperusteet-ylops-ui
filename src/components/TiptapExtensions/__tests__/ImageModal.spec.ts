import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import { mount, createLocalVue } from '@vue/test-utils';
import ImageExtension from '../ImageExtension';
import ImageModal from '../ImageModal.vue';
import { Kielet } from '@shared/stores/kieli';
import { IAttachmentWrapper } from '@/stores/kuvat';

import '@shared/config/bootstrap';
import '@shared/config/fontawesome';
import VueI18n from 'vue-i18n';
import { Kaannos } from '@shared/plugins/kaannos';

describe('Tiptap Image Extension', () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  Kielet.install(localVue);
  localVue.use(new Kaannos());

  const i18n = Kielet.i18n;

  test('Prose mirror extension', async () => {
    const extension = new ImageExtension(13);
    expect(extension.name).toBe('image');
    expect(extension.extensions).toEqual([]);
    expect(extension.schema.attrs['data-uid']).toBeTruthy();
  });

  describe('Mounted extension component', () => {
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
        kuvatekstiProp: { fi: 'xyz' },
        loader,
      },
      mocks: {
        $t: x => x,
      },
      i18n,
      localVue,
    } as any);
  });
});
