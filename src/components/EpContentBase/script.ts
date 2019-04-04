import { Component, Mixins, Prop, Vue } from 'vue-property-decorator';

import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import CKEditor from '@ckeditor/ckeditor5-vue';

import EpViewer from '@/components/EpViewer/EpViewer.vue';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';
const Ckeditor = CKEditor.component;

@Component({
  components: {
    Ckeditor,
    EpViewer,
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

  @Prop({ default: 'fi' })
  private locale!: string;

  private editor = InlineEditor;

  public get config() {
    return {
      language: this.locale,
      toolbar: [
        'bold', 'italic',
        '|',
        'numberedList', 'bulletedList',
        '|',
        'undo', 'redo',
      ],
    };
  }

  // Validointi tapahtuu tämän metodin avulla
  get isEditing() {
    return this.isEditable;
  }
}
