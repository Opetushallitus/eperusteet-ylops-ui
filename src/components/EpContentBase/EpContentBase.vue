<template lang="pug">
div.ep-content-base
  div(v-if="isEditable")
    pre(ng-bind="value | json")
    trumbowyg(:value="value", :config="config", @input="$emit('input', $event)")
    //- ck-editor(
      :value="value",
      :layout="layout",
      :locale="locale",
      :opsId="opsId",
      :opsKasitteet="opsKasitteet",
      @input="$emit('input', $event)")
    //- .valid-feedback(v-if="!validationError && validMessage") {{ $t(validMessage) }}
    //- .invalid-feedback(v-else-if="validationError && invalidMessage ") {{ $t(invalidMessage) }}
    //- .invalid-feedback(v-else-if="validationError && !invalidMessage") {{ $t('validation-error-' + validationError, validation.$params[validationError]) }}
    //- small.form-text.text-muted(v-if="help && isEditing") {{ $t(help) }}
  ep-viewer(
    v-else,
    :value="value",
    :opsKasitteet="opsKasitteet")
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

// import CkEditor from '@/components/CkEditor/CkEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';
import Trumbowyg from 'vue-trumbowyg';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';

import 'katex/dist/katex.css';
// import 'mathjax/latest.js';

import 'trumbowyg/dist/ui/trumbowyg.css';

import 'trumbowyg/plugins/table/trumbowyg.table.js';
import 'trumbowyg/plugins/table/ui/sass/trumbowyg.table.scss';

import 'trumbowyg/plugins/mathml/trumbowyg.mathml.js';
import 'trumbowyg/plugins/mathml/ui/sass/trumbowyg.mathml.scss';

@Component({
  components: {
    // CkEditor,
    EpViewer,
    Trumbowyg,
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
}
</script>

<style scoped lang="scss">
.ep-content-base {
  /deep/ abbr {
    border-bottom: 1px dotted #999;
    cursor: help;
  }
}
</style>
