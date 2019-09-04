<template>
<div class="ep-content-base editor">
  <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
    <div class="menubar">
      <button
        class="menubar__button"
        :class="{ 'is-active': isActive.bold() }"
        @click="commands.bold">
        BOLD
      </button>
    </div>
  </editor-menu-bar>
  <editor-content :editor="editor" />
</div>
</template>

<script lang="ts">
  // <pre ng-bind="value | json"></pre>
  // <div v-if="isEditable">
  //   <hr />
  //   <ck-editor :value="value" :layout="layout" :locale="locale" :opsId="opsId" :opsKasitteet="opsKasitteet" @input="$emit('input', $event)">
  //   </ck-editor>
  //   <div class="valid-feedback" v-if="!validationError && validMessage">{{ $t(validMessage) }}</div>
  //   <div class="invalid-feedback" v-else-if="validationError && invalidMessage ">{{ $t(invalidMessage) }}</div>
  //   <div class="invalid-feedback" v-else-if="validationError && !invalidMessage">{{ $t('validation-error-' + validationError, validation.$params[validationError]) }}</div>
  //   <small class="form-text text-muted" v-if="help && isEditing">{{ $t(help) }}</small>
  // </div>

import { Watch, Component, Mixins, Prop } from 'vue-property-decorator';

// import CkEditor from '@/components/CkEditor/CkEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';

import 'katex/dist/katex.css';

import {
  Editor,
  EditorContent,
  EditorFloatingMenu,
  EditorMenuBar,
  EditorMenuBubble,
} from 'tiptap';

import {
  Blockquote,
  Bold,
  BulletList,
  Code,
  CodeBlock,
  HardBreak,
  Heading,
  History,
  Italic,
  Link,
  ListItem,
  OrderedList,
  Strike,
  Underline,
} from 'tiptap-extensions';


@Component({
  components: {
    Editor,
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBar,
    EditorMenuBubble,
  },
})
export default class EpContentBase extends Mixins(EpValidation) {
  @Prop({ required: true })
  private value!: string;

  @Prop({ required: true })
  private isEditable!: boolean;

  // CkEditorin layout (määrittää editorin ominaisuudet)
  @Prop({ default: 'simplified' })
  private layout!: EditorLayout;

  // OPS ID (kuvien tallennus)
  @Prop({ default: 0 })
  private opsId!: number;

  // OPS:n käsitteet
  @Prop({ default: () => {} })
  private opsKasitteet!: object;

  @Prop({ default: '' })
  private help!: string;

  @Prop({ default: 'fi' })
  private locale!: string;

  onUpdate($event) {
    this.$emit('input', $event);
  }

  private editor: Editor = null;

  mounted() {
    this.editor = new Editor({
      content: this.value,
      editable: false,
      onUpdate: () => {
        this.onUpdate(this.editor.getHTML());
      },
      extensions: [
        new Blockquote(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ levels: [1, 2, 3] }),
        new BulletList(),
        new OrderedList(),
        new ListItem(),
        new Bold(),
        new Code(),
        new Italic(),
        new Link(),
        new Strike(),
        new Underline(),
        new History(),
      ],
    });
  }

  @Watch('isEditable')
  onEditableChange(val) {
    this.editor.setOptions({
      ...this.editor.options,
      editable: this.isEditable,
    });
  }

  @Watch('value')
  onValueChange(val) {
    if (this.editor && val !== this.value) {
      this.editor.setContent(val);
    }
  }

  // Validointi tapahtuu tämän metodin avulla
  get isEditing() {
    return this.isEditable;
  }

  getEditorLayout(layout: EditorLayout) {
    const minimal = ['undo', 'redo'];
    const simplified = [
      minimal,
      ['strong', 'em', 'del'],
    ];
    const full = [
      ...simplified,
      ['link', 'mathml'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
      ['unorderedList', 'orderedList'],
      ['removeformat'],
      ['fullscreen'],
      // ['superscript', 'subscript'],
      // ['insertImage'],
    ];

    if (layout === 'normal') {
      return full;
    }
    else if (layout === 'simplified') {
      return simplified;
    }
    else {
      return minimal;
    }
  }

  get config() {
    return {
      btns: [...this.getEditorLayout(this.layout)],
      plugins: {
        table: {
        },
      },
    };
  }

  beforeDestroy() {
    this.editor.destroy()
  }

}
</script>

<style scoped lang="scss">
.ep-content-base {
  width: 512px;
  /deep/ abbr {
    border-bottom: 1px dotted #999;
    cursor: help;
  }
}

.is-active {
  font-weight: 600;
}
</style>
