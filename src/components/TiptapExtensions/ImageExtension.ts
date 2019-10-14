import { Node, Mark, Plugin } from 'tiptap';
import Vue from 'vue';
import VueSelect from 'vue-select';

import { KieliStore } from '@shared/stores/kieli';
import { IAttachmentWrapper, createLiitetiedostoHandler } from '@/stores/kuvat';
import { domAttrsGetter, mapNodeAttrs } from './helpers';
import ImageModal from './ImageModal.vue';


export default class ImageExtension extends Node {
  public constructor(private opsId: number) {
    super();
  }

  get name() {
    return 'image';
  }

  get extensions() {
    return [];
  }

  get schema() {
    return {
      attrs: {
        'data-uid': {
          default: '',
        },
      },
      content: 'block*',
      group: 'block',
      draggable: true,
      parseDOM: [{
        tag: 'img',
        getAttrs: domAttrsGetter('data-uid'),
      }],
      toDOM: (node: any) => ['img', node.attrs],
    };
  }

  commands({ type }) {
    return (attrs: any) => {
      return (state, dispatch) => {
        const { selection } = state;
        const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos;
        const node = type.create(attrs);
        const tx = state.tr.insert(position, node);
        dispatch(tx);
      };
    };
  }

  get view() {
    const opsId = this.opsId;
    return Vue.extend({
      components: {
        ImageModal,
        VueSelect,
      },
      props: ['node', 'updateAttrs', 'view'],
      data() {
        return {
          isOpen: false,
          liitteet: createLiitetiedostoHandler(opsId),
        };
      },
      methods: {
        async open() {
          if (!this.view.editable) {
            return;
          }

          const self = (this as any);
          const h = this.$createElement;
          const t = (v: string): string => KieliStore.i18n.t(v) as string;
          const editor = h(ImageModal, {
            props: {
              value: self.dataUid,
              loader: self.liitteet,
            },
            on: {
              input(value: string) {
                self.dataUid = value;
              },
            },
          });
          this.$bvModal.msgBoxOk([editor], {
            buttonSize: 'sm',
            centered: true,
            size: 'sm',
            title: [h('div', {}, t('valitse-kuva'))],
          });
        },
      },
      computed: {
        ...mapNodeAttrs('title', 'alt'),
        dataUid: {
          get() {
            return (this as any).node.attrs['data-uid'];
          },
          set(value: any) {
            (this as any).updateAttrs({
              'data-uid': value,
            });
          },
        },
        url() {
          return this.liitteet.url((this as any).dataUid);
        },
      },
      template: `
        <div class="ep-editor-component">
          <img class="content-image" @click="open()" :data-uid="dataUid" :src="url" :title="title" :alt="alt">
        </div>
      `,
    });
  }
}
