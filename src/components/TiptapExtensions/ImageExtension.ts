import { Node, Mark, Plugin } from 'tiptap';
import Vue from 'vue';
import VueSelect from 'vue-select';

import { KieliStore } from '@shared/stores/kieli';
import { IAttachmentWrapper, createLiitetiedostoHandler } from '@/stores/kuvat';
import { domAttrsGetter, mapNodeAttrs } from './helpers';
import ImageModal from './ImageModal.vue';
import EpButton from'@shared/components/EpButton/EpButton.vue';
import _ from 'lodash';

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
        'alt': {
          default: '',
        },
      },
      content: 'block*',
      group: 'block',
      draggable: true,
      parseDOM: [{
        tag: 'img',
        getAttrs: domAttrsGetter('data-uid', 'alt'),
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
        EpButton,
      },
      props: ['node', 'updateAttrs', 'view'],
      data() {
        return {
          isOpen: false,
          liitteet: createLiitetiedostoHandler(opsId),
        };
      },
      mounted() {
        if(!(this as any).node.attrs['data-uid']) {
          (this as any).open();
        }
      },
      methods: {
        async open() {
          if (!this.view.editable) {
            return;
          }

          const self = (this as any);
          const h = this.$createElement;
          const t = (v: string): string => KieliStore.i18n.t(v) as string;
          const oldAltText = self.altText;
          const oldDataUid = self.dataUid;
          const uidObs = Vue.observable({value: self.dataUid});
          const editor = h(ImageModal, {
            props: {
              value: uidObs,
              loader: self.liitteet,
              kuvatekstiProp: self.altText,
            },
            on: {
              input: (value: string) =>  {
                self.dataUid = value;
                uidObs.value = value;
              },
              onKuvatekstichange(value: string) {
                self.altText = value;
              },
            },
          });

          this.$bvModal.msgBoxConfirm([editor], {
            buttonSize: 'sm',
            centered: true,
            size: 'sm',
            noCloseOnBackdrop: true,
            noCloseOnEsc: true,
            title: [h('div', {}, t('valitse-kuva'))],
          });

          this.$root.$on('bv::modal::hide', (bvEvent, modalId) => {
            if(bvEvent.trigger === 'cancel') {
              self.altText = oldAltText;
              self.dataUid = oldDataUid;
            }
            else {
              if(!_.isEmpty(self.dataUid) && _.isEmpty(self.altText)) {
                bvEvent.preventDefault();
              }
            }
          });
        },
      },
      computed: {
        ...mapNodeAttrs('title'),
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
        altText: {
          get() {
            return (this as any).node.attrs['alt'];
          },
          set(value: any) {
            (this as any).updateAttrs({
              'alt': value,
            });
          },
        },
        url() {
          return this.liitteet.url((this as any).dataUid);
        },
      },
      template: `
        <div>

          <div v-if="view.editable" class="ep-editor-component">

            <figure class="text-center" v-if="dataUid">
              <img class="content-image" @click="open()" :data-uid="dataUid" :src="url" :title="title" :alt="altText">
              <figcaption>{{altText}}</figcaption>
            </figure>

            <ep-button v-if="!dataUid" variant="outline" icon="plussa" @click="open()">{{$t('lisaa-kuva')}}</ep-button>
          </div>

          <figure v-if="dataUid && !view.editable" class="text-center">
            <img class="content-image" @click="open()" :data-uid="dataUid" :src="url" :title="title" :alt="altText">
            <figcaption>{{altText}}</figcaption>
          </figure>

        </div>
      `,
    });
  }
}
