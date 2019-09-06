<template>

<div class="ep-content-base">
  <div v-if="isEditable">
    <editor-menu-bar :editor="editor"
                     v-slot="{ commands, isActive, focused }"
                     v-sticky="sticky"
                     sticky-offset="{ top: 103 }"
                     sticky-z-index="400">
      <div :class="{ 'd-none': !focused }"> <!-- sticky element -->
        <div :class="{'editor-toolbar': !sticky, 'editor-toolbar-sticky': sticky, 'd-none': !focused}">
          <div class="btn-toolbar" role="toolbar">
            <div class="btn-group mr-2" role="group">
              <button type="button"
                      class="btn btn-primary"
                      disabled><fas icon="undo" fixed-width /></button>
              <button type="button"
                      class="btn btn-primary"
                      disabled><fas icon="redo" fixed-width /></button>
              <!-- Need handle language change -->
              <!--<button type="button"
                      class="btn btn-primary"
                      @click="commands.undo"><fas icon="undo" fixed-width /></button>
              <button type="button"
                      class="btn btn-primary"
                      @click="commands.redo"><fas icon="redo" fixed-width /></button>-->
            </div>
            <div class="btn-group mr-2" role="group">
              <button type="button"
                      class="btn btn-primary"
                      :class="{ 'active': isActive.bold() }"
                      @click="commands.bold"><fas icon="bold" fixed-width /></button>
              <button type="button"
                      class="btn btn-primary"
                      :class="{ 'active': isActive.italic() }"
                      @click="commands.italic"><fas icon="italic" fixed-width /></button>
              <button type="button"
                      class="btn btn-primary"
                      :class="{ 'active': isActive.strike() }"
                      @click="commands.strike"><fas icon="strikethrough" fixed-width /></button>
            </div>
            <div class="btn-group mr-2" role="group">
              <button type="button"
                      class="btn btn-primary"
                      :class="{ 'active': isActive.bullet_list() }"
                      @click="commands.bullet_list"><fas icon="list-ul" fixed-width /></button>
              <button type="button"
                      class="btn btn-primary"
                      :class="{ 'active': isActive.ordered_list() }"
                      @click="commands.ordered_list"><fas icon="list-ol" fixed-width /></button>
            </div>
          </div>
        </div>
      </div>
    </editor-menu-bar>
    <editor-content :editor="editor" :editor-class="'form-control'" style="margin-top: 10px" />
    <div class="valid-feedback"
         v-if="!validationError && validMessage">{{ $t(validMessage) }}</div>
    <div class="invalid-feedback"
         v-else-if="validationError && invalidMessage ">{{ $t(invalidMessage) }}</div>
    <div class="invalid-feedback"
         v-else-if="validationError && !invalidMessage">{{ $t('validation-error-' + validationError, validation.$params[validationError]) }}</div><small class="form-text text-muted" v-if="help && isEditing">{{ $t(help) }}</small></div>
  <ep-viewer v-else :value="value" :opsKasitteet="opsKasitteet"></ep-viewer>
</div>

</template>

<script lang="ts">

import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import { Editor, EditorMenuBar } from 'tiptap';
import {
  Blockquote,
  Bold,
  BulletList,
  Code,
  CodeBlock,
  HardBreak,
  History,
  Italic,
  Link,
  ListItem,
  OrderedList,
  Strike,
  Underline,
} from 'tiptap-extensions';
import Sticky from 'vue-sticky-directive';

import EpViewer from '@/components/EpViewer/EpViewer.vue';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';

import EditorContent from './EditorContent';

import 'katex/dist/katex.css';

@Component({
  components: {
    EpViewer,
    EditorContent,
    EditorMenuBar,
  },
  directives: {
    Sticky,
  },
})
export default class EpContentBase extends Mixins(EpValidation) {
  @Prop({ required: true })
  private value!: string;

  @Prop({ required: true })
  private isEditable!: boolean;

  // layout (määrittää editorin ominaisuudet)
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

  @Prop({ default: false })
  private sticky!: boolean;

  // Validointi tapahtuu tämän metodin avulla
  get isEditing() {
    return this.isEditable;
  }

  private editorChange = false;

  // menubarin slotit eivät toimi jos luodaan mounted funktiossa
  private editor = new Editor({
    content: this.value,
    editable: false,
    onUpdate: () => {
      this.setUpEditorEvents();
    },
    extensions: [
      new Blockquote(),
      new CodeBlock(),
      new HardBreak(),
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

  public beforeDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  private setUpEditorEvents() {
    if (this.editor) {
      const data = this.editor.getHTML();
      this.editorChange = true;

      this.$emit('input', data);
    }
  }

  @Watch('isEditable')
  private onEditableChange(val) {
    if (this.editor) {
      this.editor.setOptions({
        ...this.editor.options,
        editable: this.isEditable,
      });
    }
  }

  @Watch('value')
  private onValueChange(newVal) {
    if (this.editor && !this.editorChange) {
      if (newVal === undefined) {
        this.editor.clearContent(true);
      }
      else {
        this.editor.setContent(newVal, true);
      }
    }
    this.editorChange = false;
  }

}

</script>

<style scoped lang="scss">

@import "@/styles/_variables.scss";

.ep-content-base {
  /deep/ abbr {
    border-bottom: 1px dotted #999;
    cursor: help;
  }

  .menu-placeholder {
    margin-bottom: 57px;
  }

  /*
  .editor-toolbar {
    background-color: #f1f1f1;
    border: 1px solid #d1d1d1;
    padding: 5px;
    border-radius: .25rem;;
  }
  */

  .editor-toolbar-sticky {
    background-color: #fff;
    padding: 5px $content-padding;
    border-bottom: 1px solid #eee;
    position: relative;
    left: -$content-padding;
    width: calc(100% + #{ 2 * $content-padding })
  }

  /deep/ .form-control {
    height: auto !important;
  }
}

</style>
