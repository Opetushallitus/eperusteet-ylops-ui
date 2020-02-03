import { Mark } from 'tiptap';
import { updateMark, removeMark, toggleMark, markInputRule, markPasteRule } from 'tiptap-commands';


export default class CommentExtension extends Mark {

  get name() {
    return 'span';
  }

  get schema() {
    return {
      attrs: {
        kommentti: {
          default: null,
        },
      },
      parseDOM: [{
        tag: 'span[kommentti]',
        getAttrs: (dom: any) => ({
          kommentti: dom.getAttribute('kommentti'),
        }),
      }],
      toDOM: (node: any) => ['span', {
        ...node.attrs,
      }, 0],
    }
  }

  // keys({ type }) {
  //   return {
  //     'Mod-b': toggleMark(type),
  //   }
  // }

  commands({ type }) {
    return attrs => {
      if (attrs.href) {
        return updateMark(type, attrs)
      }

      return removeMark(type)
    }
  }

  // inputRules({ type }) {
  //   return [
  //     markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, type),
  //   ]
  // }
  //
  // pasteRules({ type }) {
  //   return [
  //     markPasteRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)/g, type),
  //   ]
  // }
}
