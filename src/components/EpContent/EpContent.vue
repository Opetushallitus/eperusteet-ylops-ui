<template>

<div class="ep-content">
  <ep-editor-menu-bar
    :opetussuunnitelma-store="opetussuunnitelmaStore"
    :layout="layout"
    :is-editable="isEditable"
    :sticky="sticky"
    :editor="editor"
    v-if="focused" />
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

import ImageExtension from '@/components/TiptapExtensions/ImageExtension';
import TermiExtension from '@/components/TiptapExtensions/TermiExtension';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import { Editor, EditorContent } from 'tiptap';
import { Kielet } from '@/stores/kieli';
import { createKasiteHandler } from '@/stores/kuvat';
import {
  Blockquote,
  Bold,
  Underline,
  Strike,
  Italic,
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

import EpEditorMenuBar from './EpEditorMenuBar.vue';
import Sticky from 'vue-sticky-directive';
import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';


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
  help!: string;

  @Prop({ default: false })
  sticky!: boolean;

  private editor: any = null;

  private focused = false;

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
    const extensions = [
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
      new Table({ resizable: true }),
      new TableHeader(),
      new TableCell(),
      new TableRow(),
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

      if (val) {
        this.setClass('form-control');
      }
      else {
        this.setClass('');
      }

      this.editor.setOptions({
        editable: !!val,
      });
    });
  }

  setClass(c: string) {
    this.$nextTick(() => {
      (this.$refs.content as any).$el.firstChild.className = 'ProseMirror ' + c;
    });
  }

  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy();
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
        [Kielet.getSisaltoKieli() as unknown as string]: data,
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

@import "@/styles/_variables.scss";

.ep-content {
  padding: 0;

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
      border: 1px solid #ddd;
      padding: 4px;
    }
  }

  /deep/ abbr.virheellinen {
    color: $invalid;
  }

  /deep/ .form-control {
    &.ProseMirror-focused {
      border-top-right-radius: 0;
      border-top-left-radius: 0;
    }

    &:focus {
      outline: none !important;
      box-shadow: none !important;
    }
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
