<template>

<div class="ep-content">
  <ep-editor-menu-bar
    :opetussuunnitelma-store="opetussuunnitelmaStore"
    :layout="layout"
    :is-editable="isEditable"
    :sticky="sticky"
    :editor="editor"
    :help="toolbarHelp" />
  <editor-content
    ref="content"
    :editor="editor"
    :class="{ 'content-invalid': validation && validationError, 'content-valid': validation && !validationError }" />
  <div class="valid-feedback" v-if="!validationError && validMessage && isEditable">{{ $t(validMessage) }}</div>
  <div class="invalid-feedback" v-else-if="validationError && invalidMessage && isEditable">{{ $t(invalidMessage) }}</div>
  <div class="invalid-feedback" v-else-if="validationError && !invalidMessage && isEditable">{{ $t('validation-error-' + validationError, validation.$params[validationError]) }}</div>
  <small class="form-text text-muted" v-if="help && isEditable">{{ $t(help) }}</small>
</div>

</template>

<script lang="ts">

import * as _ from 'lodash';
import ImageExtension from '@/components/TiptapExtensions/ImageExtension';
import TermiExtension from '@/components/TiptapExtensions/TermiExtension';
import CommentExtension from '@/components/TiptapExtensions/CommentExtension';
import CustomLink from '@/components/TiptapExtensions/CustomLink';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import { Editor, EditorContent } from 'tiptap';
import { Kielet } from '@shared/stores/kieli';
import { createKasiteHandler } from '@/stores/kuvat';
import {
  Blockquote,
  Bold,
  BulletList,
  HardBreak,
  History,
  Italic,
  Link,
  ListItem,
  OrderedList,
  Strike,
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from 'tiptap-extensions';

import EpEditorMenuBar from './EpEditorMenuBar.vue';
import Sticky from 'vue-sticky-directive';
import { EditorLayout } from '@shared/tyypit';
import EpValidation from '@shared/mixins/EpValidation';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

@Component({
  name: 'EpContent',
  components: {
    EditorContent,
    EpEditorMenuBar,
  },
  directives: {
    Sticky,
  },
})
export default class EpContent extends Mixins(EpValidation) {
  @Prop({ default: null })
  private opetussuunnitelmaStore!: OpetussuunnitelmaStore | null;

  @Prop({ required: true })
  value!: Object;

  @Prop({ default: false })
  isEditable!: boolean;

  @Prop()
  locale!: string;

  @Prop({ required: true })
  layout!: EditorLayout;

  @Prop({ default: false })
  isPlainString!: boolean;

  @Prop({ default: '' })
  toolbarHelp!: string;

  @Prop({ default: '' })
  help!: string;

  @Prop({ default: false })
  sticky!: boolean;

  private editor: any = null;

  private focused = false;

  get lang() {
    return this.locale || Kielet.getSisaltoKieli.value || 'fi';
  }

  get localizedValue() {
    if (!this.value) {
      return '';
    }
    else if (this.isPlainString) {
      return this.value || '';
    }
    else if (_.isObject(this.value)) {
      return this.value[this.lang] || '';
    }
    else {
      return this.value;
    }
  }

  mounted() {
    const extensions = [
      new HardBreak(),
      new History(),
      new Blockquote(),
      new Bold(),
      new Italic(),
      new Strike(),
      new CustomLink(),
      new BulletList(),
      new OrderedList(),
      new ListItem(),
      new Table({ resizable: true }),
      new TableHeader(),
      new TableCell(),
      new TableRow(),
      new CommentExtension(),
    ];

    if (this.opetussuunnitelmaStore) {
      const kasiteHandler = createKasiteHandler(this.opetussuunnitelmaStore.opsId);
      extensions.push(new TermiExtension(kasiteHandler));
      extensions.push(new ImageExtension(this.opetussuunnitelmaStore.opsId));
    }

    this.editor = new Editor({
      content: this.localizedValue,
      editable: this.isEditable,
      onUpdate: () => {
        this.setUpEditorEvents();
      },
      onFocus: () => {
        this.focused = true;
      },
      onBlur: () => {
        this.focused = false;
      },
      extensions,
    });
  }

  @Watch('isEditable', { immediate: true })
  onChange(val, oldVal) {
    if (val === oldVal) {
      return;
    }

    this.$nextTick(() => {
      if (!this.editor) {
        return;
      }

      this.editor.setOptions({
        editable: val,
      });

      if (val) {
        this.setClass('form-control');
      }
      else {
        this.setClass('');
      }
    });
  }

  async setClass(c: string) {
    // HACK: give prose mirror 10 vue ticks.
    for (let count = 0; count < 10; ++count) {
      await this.$nextTick();
      const content = (this.$refs.content as any);
      if (content) {
        const pm = content.$el.firstChild;
        if (pm) {
          content.$el.firstChild.className = 'ProseMirror ' + c;
          break;
        }
      }
    }
  }

  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  @Watch('localizedValue', {
    immediate: true,
  })
  onValueUpdate(val, old) {
    if (this.editor && !this.focused) {
      this.editor.setContent(this.localizedValue);
    }
  }

  setUpEditorEvents() {
    const data = this.editor.getHTML();
    if (this.isPlainString) {
      this.$emit('input', data);
    }
    else {
      this.$emit('input', {
        ...this.value,
        [Kielet.getSisaltoKieli.value as unknown as string]: data,
      });
    }
  }

  @Watch('lang')
  onEditableChange(val) {
    if (this.editor) {
      this.editor.setContent(this.localizedValue);
    }
  }
}

</script>

<style scoped lang="scss">

@import "@shared/styles/_variables.scss";

.ep-content {
  padding: 0;
  word-break: break-word;

  /deep/ abbr {
    text-decoration: none !important;
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
    margin: 0;
    overflow: hidden;
    table-layout: fixed;
    width: 100%;

    td, th {
      vertical-align: top;
      border: 1px solid #ddd;
      padding: 4px;
    }
  }

  /deep/ abbr.virheellinen {
    color: $invalid;
  }

  /deep/ .form-control.ProseMirror {
    border-top-right-radius: 0;
    border-top-left-radius: 0;
  }

  /deep/ [contenteditable]:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  /deep/ .tableWrapper .selectedCell {
    background-color: $gray-lighten-5;
  }

  .content-invalid /deep/ .form-control {
    border-color: $invalid;
  }

  .content-valid /deep/ .form-control {
    border-color: $valid;
  }

}

// Piilotettu Bootstrapissa oletuksena
/deep/ .invalid-feedback,
/deep/ .valid-feedback {
  display: block;
}

</style>
