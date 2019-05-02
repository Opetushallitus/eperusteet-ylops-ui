import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';

import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

import { CkUploadAdapter } from '@/ckplugins/CkUploadAdapter/CkUploadAdapter';
import CkKasitePlugin from '@/ckplugins/CkKasitePlugin/CkKasitePlugin';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';
import { createLogger } from '@/stores/logger';

const logger = createLogger('CkEditor');
const commonPlugins = [
  Clipboard,
  Essentials,
  ParagraphPlugin,
  PasteFromOffice,
];
const imageConfig = {
  toolbar: [
    'imageTextAlternative',
  ],
};

@Component
export default class CkEditor extends Mixins(EpValidation) {
  // Muokattava tieto (tukee v-model:ia)
  @Prop()
  private value!: string;

  // Editorin layout (määrittää ominaisuudet)
  @Prop({ default: 'normal' })
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
      enableImageUpload = (this.opsId > 0);
      config = this.getSimplifiedSettings(enableImageUpload);
      break;
    case 'normal':
      enableImageUpload = (this.opsId > 0);
      config = this.getNormalSettings(enableImageUpload);
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

  private getSimplifiedSettings(uploadEnabled: boolean): object {
    return {
      language: this.locale,
      plugins: [
        ...commonPlugins,
        Bold,
        Italic,
        Image,
        ImageStyle,
        ...uploadEnabled ? [ImageUpload] : [],
        ImageToolbar,
        ListPlugin,
      ],
      toolbar: [
        'bold', 'italic',
        ...uploadEnabled ? ['|', 'imageUpload'] : [],
        '|',
        'bulletedList', 'numberedList',
        '|',
        'undo', 'redo',
      ],
      image: imageConfig,
    };
  }

  private getNormalSettings(uploadEnabled: boolean): object {
    return {
      language: this.locale,
      plugins: [
        ...commonPlugins,
        Bold,
        CkKasitePlugin,
        Italic,
        Image,
        ImageStyle,
        ...uploadEnabled ? [ImageUpload] : [],
        ImageToolbar,
        ListPlugin,
        LinkPlugin,
        Table,
        TableToolbar,
      ],
      toolbar: [
        'bold', 'italic',
        ...uploadEnabled ? ['|', 'imageUpload'] : [],
        '|',
        'bulletedList', 'numberedList',
        '|',
        'link', 'insertTable', 'insertKasite',
        '|',
        'undo', 'redo',
      ],
      image: imageConfig,
    };
  }
}
