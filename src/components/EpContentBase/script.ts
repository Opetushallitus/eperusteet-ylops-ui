import { Component, Mixins, Prop } from 'vue-property-decorator';

import CkEditor from '@/components/CkEditor/CkEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';

import 'katex/dist/katex.css';

@Component({
  components: {
    CkEditor,
    EpViewer,
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

  get inputClass() {
    return {
      'is-invalid': this.isInvalid,
      'is-valid': this.isValid,
    };
  }
}
