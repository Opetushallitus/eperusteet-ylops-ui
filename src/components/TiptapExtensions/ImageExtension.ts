import { Node, Mark, Plugin } from 'tiptap';
import Vue from 'vue';
import VueSelect from 'vue-select';

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
      mounted() {
        if (!(this as any).node.attrs['data-uid']) {
          setTimeout(() => {
            (this.$refs.kuvanLisaysPopover as Vue).$emit('open');
          }, 100);
        }
      },
      methods: {
        async close() {
          if (!this.view.editable) {
            return;
          }
          this.isOpen = false;
          (this.$refs.kuvanLisaysPopover as Vue).$emit('close');
        },
        async open() {
          if (!this.view.editable) {
            return;
          }
          this.isOpen = !this.isOpen;
          (this.$refs.kuvanLisaysPopover as Vue).$emit(this.isOpen ? 'close' : 'open');
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
            if (value) {
              ((this as any).$refs.kuvanLisaysPopover as Vue).$emit('close');
            }
          },
        },
        id() {
          return 'editor-popover-' + (this as any)._uid;
        },
        url() {
          return this.liitteet.url((this as any).dataUid);
        },
      },
      template: `
        <div class="ep-editor-component">
          <img class="content-image" @click="open()" :data-uid="dataUid" :src="url" :title="title" :alt="alt" :id="id">
          <b-popover v-if="view.editable" ref="kuvanLisaysPopover" :target="id">
            <template slot="title">
              {{ $t('kuvan-valitsin') }}
            </template>
            <image-modal v-model="dataUid" :loader="liitteet"></image-modal>
            <b-button variant="link" @click="close">
              {{ $t('sulje') }}
            </b-button>
          </b-popover>
        </div>
      `,
    });
  }
}
