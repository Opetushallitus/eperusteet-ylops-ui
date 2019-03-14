import { Component, Mixins, Prop, Vue } from 'vue-property-decorator';

import CkEditor from '@/components/CkEditor/CkEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';

@Component({
  components: {
    EpViewer,
    CkEditor,
  },
})
export default class EpContentBase extends Mixins(EpValidation) {
  @Prop({ required: true })
  private value!: string;

  @Prop({ required: true })
  private isEditable!: boolean;

  // CkEditorin layout (määrittää ominaisuudet)
  @Prop({ default: 'simplified' })
  private layout!: EditorLayout;

  @Prop({ default: '' })
  private help!: string;

  // Validointi tapahtuu tämän metodin avulla
  get isEditing() {
    return this.isEditable;
  }
}
