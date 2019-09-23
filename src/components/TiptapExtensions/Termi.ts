import { Node, Mark, Plugin } from 'tiptap';
import Vue from 'vue';
import VueSelect from 'vue-select'

import { IAttachmentWrapper, createLiitetiedostoHandler } from '@/stores/kuvat';
import { domAttrsGetter, mapNodeAttrs } from './helpers';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';


export default class Termi extends Node {
  public constructor(private opsId: number) {
    super();
  }

  get name() {
    return 'termi'
  }

  // get extensions() {
  //   return [];
  // }

  get schema() {
    return {
      attrs: {
        'data-viite': {
          default: '',
        },
      },
      // content: 'inline*',
      // group: 'block',
      // inline: true,
      inclusive: false,
      parseDOM: [{
        tag: 'abbr',
        getAttrs: domAttrsGetter('data-viite'),
      }],
      toDOM: (node: any) => ['abbr', node.attrs, 0],
    }
  }

  // commands({ type }) {
  //   return (attrs: any) => {
  //     return (state, dispatch) => {
  //       const { selection } = state;
  //       const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos;
  //       const node = type.create(attrs);
  //       const tx = state.tr.insert(position, node);
  //       dispatch(tx);
  //     };
  //   }
  // }

  // get view() {
  //   return Vue.extend({
  //     components: {
  //       VueSelect,
  //     },
  //     props: ['node', 'updateAttrs', 'view'],
  //     template: `
  //       <abbr title="jotain">teksti</abbr>
  //     `,
  //   });
  // }

}
