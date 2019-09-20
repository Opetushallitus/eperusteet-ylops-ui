<template>

<div class="ep-content">
  <ep-editor-menu-bar
    :sticky="true"
    :editor="editor" />
  <editor-content
    ref="content"
    :editor="editor" />
  <hr>
</div>

</template>

<script lang="ts">

import Image from '@/components/TiptapExtensions/Image';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import { Editor, EditorContent } from 'tiptap';
import { Kielet } from '@/stores/kieli';
import {
  Blockquote,
  Bold,
  Underline,
  Strike,
  Italic,

  Code,
  CodeBlock,
  HardBreak,
  History,

  BulletList,
  ListItem,
  OrderedList,

  Table,
  TableCell,
  TableHeader,
  TableRow,

} from 'tiptap-extensions';

import EpEditorMenuBar from '@/components/EpContentBase/EpEditorMenuBar.vue';
import Sticky from 'vue-sticky-directive';
import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';


@Component({
  components: {
    EditorContent,
    EpEditorMenuBar,
  },
  directives: {
    Sticky,
  },
})
export default class EpContent extends Mixins(EpValidation) {
  @Prop({ required: true, })
  private value!: Object;

  @Prop({ default: false })
  private isEditable!: boolean;
  
  @Prop()
  private locale!: string;

  // layout (määrittää editorin ominaisuudet)
  @Prop({ default: 'simplified' })
  private layout!: EditorLayout;
  
  @Prop({ default: false })
  private isPlainString!: boolean;
  
  // // OPS ID (kuvien tallennus)
  // @Prop({ default: 0 })
  // private opsId!: number;

  // // OPS:n käsitteet
  // @Prop({ default: () => {} })
  // private opsKasitteet!: object;

  // @Prop({ default: '' })
  // private help!: string;

  // @Prop({ default: 'fi' })
  // private locale!: string;

  // @Prop({ default: false })
  // private sticky!: boolean;

  private editor: any = null;

  // Validointi tapahtuu tämän metodin avulla
  // get isEditing() {
  //   return this.isEditable;
  // }

  get lang() {
    return this.locale || Kielet.getSisaltoKieli() || 'fi';
  }

  get localizedValue() {
    if (this.isPlainString) {
      return this.value || '';
    }
    else {
      if (!this.value) {
        return '';
      }
      return this.value[this.lang] || '';
    }
  }

  mounted() {
    this.editor = new Editor({
      content: this.localizedValue,
      editable: true,
      // editorProps: {
      //   transformPastedHTML(html: string) {
      //     console.log(html);
      //     return html;
      //   },
      // },
      onUpdate: () => {
        this.setUpEditorEvents();
      },
      extensions: [
        new HardBreak(),

        new History(),

        new Blockquote(),
        new Bold(),
        new Italic(),
        new Strike(),
        new Underline(),

        new BulletList(),
        new OrderedList(),
        new ListItem(),

        new Image(),

        new Table({ resizable: true, }),
        new TableHeader(),
        new TableCell(),
        new TableRow(),
      ],
    });

    setTimeout(() => {
      (this.$refs.content as any).$el.firstChild.className = 'ProseMirror form-control';
    }, 300);
  }

  public beforeDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  private setUpEditorEvents() {
    const data = this.editor.getHTML();
    if (this.isPlainString) {
      this.$emit('input', data);
    }
    else {
      this.$emit('input', {
        ...this.value,
        [Kielet.getSisaltoKieli() as unknown as string]: data,
      });
    }
  }

  @Watch('lang')
  private onEditableChange(val) {
    if (this.editor) {
      this.editor.setContent(this.localizedValue);
    }
  }

}

</script>

<style scoped lang="scss">

@import "@/styles/_variables.scss";

.ep-content {
  padding: 0px;
  /deep/ abbr {
    border-bottom: 1px dotted #999;
    cursor: help;
  }

  /deep/ .form-control {
    height: auto !important;
  }

  /deep/ table {
    border-collapse: collapse;
    border-color: #999;
    border-spacing: 1px;
    display: table;
    margin: 0%;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;

    td, th {
      border: 1px solid #ddd;
      padding: 4px;
    }
  }

}

</style>
