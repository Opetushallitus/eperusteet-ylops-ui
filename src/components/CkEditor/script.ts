import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

import { CkUploadAdapter } from '@/ckplugins/CkUploadAdapter/plugin';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';
import { createLogger } from '@/stores/logger';

const logger = createLogger('CkEditor');
const commonPlugins = [
  Clipboard,
  Essentials,
];
const imageConfig = {
  toolbar: [
    'imageTextAlternative',
    '|',
    'imageStyle:alignLeft',
    'imageStyle:full',
    'imageStyle:alignRight'
  ],
  styles: [
    'full',
    'alignLeft',
    'alignRight',
  ],
};

@Component
export default class CkEditor extends Mixins(EpValidation) {
  // Muokattava tieto (tukee v-model:ia)
  @Prop()
  private value!: string;

  // Editorin layout (määrittää ominaisuudet)
  @Prop({ default: 'simplified' })
  private layout!: EditorLayout;

  // Editorin käyttöliittymän kieli
  @Prop({ default: 'fi' })
  private locale!: string;

  // Kuvien tallennuspaikka, jos ID:tä ei ole määritelty, niin
  // kuvaominaisuuksia ei oteta käyttöön
  @Prop({ default: 0 })
  private opsId!: number;

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
    let enableImageUpload: boolean = false;

    switch (this.layout) {
    case 'simplified':
      config = this.getSimplifiedSettings();
      enableImageUpload = true;
      break;
    case 'normal':
      config = this.getNormalSettings();
      enableImageUpload = true;
      break;
    default:
      config = this.getMinimalSettings();
      break;
    }

    enableImageUpload = (enableImageUpload && this.opsId > 0);

    // Luodaan ckeditor instanssi
    try {
      // Instanssin luonti
      this.instance = await InlineEditor
        .create(this.$refs.ckeditor, config);
      this.instance.setData(this.value);
      this.setEditorEvents();

      if (enableImageUpload) {
        this.instance.plugins.get('FileRepository').createUploadAdapter = loader => {
          return new CkUploadAdapter(loader, this.opsId);
        };
      }
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
        ...commonPlugins,
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
        ...commonPlugins,
        Bold,
        Italic,
        Image,
        ImageStyle,
        ImageUpload,
        ImageToolbar,
        ListPlugin,
        ParagraphPlugin,
      ],
      toolbar: [
        'bold', 'italic',
        '|',
        'imageUpload',
        '|',
        'numberedList', 'bulletedList',
        '|',
        'undo', 'redo',
      ],
      image: imageConfig,
    };
  }

  private getNormalSettings(): object {
    return {
      language: this.locale,
      plugins: [
        ...commonPlugins,
        Alignment,
        Bold,
        Italic,
        Image,
        ImageStyle,
        ImageUpload,
        ImageToolbar,
        ListPlugin,
        LinkPlugin,
        ParagraphPlugin,
        Table,
        TableToolbar,
      ],
      toolbar: [
        'alignment', 'bold', 'italic',
        '|',
        'imageUpload',
        '|',
        'numberedList', 'bulletedList',
        '|',
        'link', 'insertTable',
        '|',
        'undo', 'redo',
      ],
      image: imageConfig,
    };
  }
}
