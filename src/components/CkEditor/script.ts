import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import { createLogger } from '@/stores/logger';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

// import Image from '@ckeditor/ckeditor5-image/src/image';
// import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
// import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';

const logger = createLogger('CkEditor');

@Component
export default class CkEditor extends Mixins(EpValidation) {
  // Editorin dom-elementin ID
  @Prop({ default: '' }) private id!: string;

  // Muokattava tieto (tukee v-model:ia)
  @Prop() private value!: string;

  // Editorin layout (määrittää ominaisuudet)
  @Prop({ default: 'simplified' })
  private layout!: EditorLayout;

  // Editorin käyttöliittymän kieli
  @Prop({ default: 'fi' }) private locale!: string;

  // CKEditorin JS instanssi
  private instance: any = null;
  private lastEmittedValue: string = '';

  public async mounted() {
    this.createEditorInstance();
  }

  public beforeDestroy() {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }

  @Watch('layout')
  private onLayoutChanged(val: EditorLayout, oldval: EditorLayout) {
    this.instance.destroy();
    this.createEditorInstance();
  }

  @Watch('value')
  private onValueChanged(val: string, oldval: string) {
    // Ei reagoida itse aiheutettuihin muutoksiin
    if (val === this.lastEmittedValue) {
      return;
    }

    // Päivitetään editoriin uusi arvo
    this.instance.setData(val || '');
  }

  private async createEditorInstance() {
    // Luodaan asetusobjekti
    let config: object;
    switch (this.layout) {
    case 'simplified':
      config = this.getSimplifiedSettings();
      break;
    case 'normal':
      config = this.getNormalSettings();
      break;
    default:
      config = this.getMinimalSettings();
      break;
    }

    // Luodaan ckeditor instanssi
    try {
      // Instanssin luonti
      this.instance = await InlineEditor
        .create(this.$refs.ckeditor, config);
      this.instance.setData(this.value);
      this.setEditorEvents();
    }
    catch (err) {
      logger.error(err);
    }
  }

  private setEditorEvents() {
    const editor = this.instance;

    editor.model.document.on('change:data', (event: any) => {
      const data = editor.getData();
      this.lastEmittedValue = data;
      this.$emit('input', data, event, editor);
    });
  }

  private getMinimalSettings(): object {
    return {
      language: this.locale,
      plugins: [
        Clipboard,
        Essentials,
      ],
      toolbar: [
        'undo', 'redo',
      ],
    };
  }

  private getSimplifiedSettings(): object {
    return {
      language: this.locale,
      plugins: [
        Bold,
        Clipboard,
        Essentials,
        Italic,
        ListPlugin,
        ParagraphPlugin,
      ],
      toolbar: [
        'bold', 'italic',
        '|',
        'numberedList', 'bulletedList',
        '|',
        'undo', 'redo',
      ],
    };
  }

  private getNormalSettings(): object {
    return {
      language: this.locale,
      plugins: [
        Alignment,
        Bold,
        Clipboard,
        Essentials,
        Italic,
        ListPlugin,
        LinkPlugin,
        ParagraphPlugin,
        Table,
        TableToolbar,
      ],
      toolbar: [
        'alignment', 'bold', 'italic',
        '|',
        'numberedList', 'bulletedList',
        '|',
        'link', 'insertTable',
        '|',
        'undo', 'redo',
      ],
    };
  }
}
