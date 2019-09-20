import { Node, Mark, Plugin } from 'tiptap';
import { updateMark, removeMark, pasteRule } from 'tiptap-commands';
import { getMarkAttrs } from 'tiptap-utils';


export default class Image extends Node {
  constructor() {
    super();
  }

  get name() {
    return 'img'
  }

  get schema() {
    return {
      // here you have to specify all values that can be stored in this node
      attrs: {
        src: {
          default: null,
        },
      },
      group: 'block',
      selectable: false,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [{
        tag: 'img',
        getAttrs: dom => ({
          src: dom.getAttribute('src'),
        }),
      }],
      toDOM: node => ['img', {
        src: node.attrs.src,
      }],
    }
  }

  // commands({ type }) {
    // return attrs => {
  // //     if (attrs.href) {
  //       return updateMark(type, attrs)
  //     }
  //     return removeMark(type)
    // }
  // }

  get view() {
    return {
      props: ['node', 'updateAttrs', 'view'],
      data: () => ({
        src: 'https://www.google.com/url?sa=i&source=images&cd=&ved=2ahUKEwiVvdCXgd3kAhXLk4sKHQmSDOMQjRx6BAgBEAQ&url=https%3A%2F%2Fbellard.org%2Fbpg%2Flena.html&psig=AOvVaw3lJF43AA0VGEy1NRsr-y4d&ust=1568986730873507',
      }),
      mounted() {
        console.log('morjens');
      },
      template: `
      <div style="background: black">
        <img :src="src">
        <input type="text" v-model="src" v-if="view.editable" />
      </div>
      `,
    };
  }
}
