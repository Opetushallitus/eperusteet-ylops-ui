import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';

import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

import { CkUploadAdapter } from '@/ckplugins/CkUploadAdapter/CkUploadAdapter';
import CkKasitePlugin from '@/ckplugins/CkKasitePlugin/CkKasitePlugin.js';
import CkMathPlugin from '@/ckplugins/CkMathPlugin/CkMathPlugin.js';
import CkCommentPlugin from '@/ckplugins/CkCommentPlugin/CkCommentPlugin.js';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';
import { createLogger } from '@/stores/logger';

const logger = createLogger('CkEditor');
const imageConfig = {
  toolbar: [
    'imageTextAlternative',
  ],
};

// Kaikkien editoritasojen yhteiset pluginit
const commonPlugins = [
  Essentials,
  ParagraphPlugin,
  PasteFromOffice,
];

// Pluginit jotka ladataan minimal tasoa ylemmillä yhteisesti
const advancedCommonPlugins = [
  Bold,
  CkCommentPlugin,
  CkKasitePlugin,
  CkMathPlugin,
  Italic,
  Image,
  ImageStyle,
  ImageToolbar,
  ListPlugin,
  Strikethrough,
];

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

  // OPS:n käsitteet (käsitemodulia varten)
  @Prop({ default: {} })
  private opsKasitteet!: object;

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

  private getConfig() {
    let config: object;
    let enableImageUpload: boolean = false;

    // Luodaan asetusobjekti
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

    return { config, enableImageUpload };
  }

  private async createEditorInstance() {
    try {
      // Luodaan ckeditor instanssi
      const { config, enableImageUpload } = this.getConfig();
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
        ...advancedCommonPlugins,
        ...uploadEnabled ? [ImageUpload] : [],
      ],
      toolbar: [
        'bold', 'italic', 'strikethrough',
        ...uploadEnabled ? ['|', 'imageUpload'] : [],
        '|',
        'bulletedList', 'numberedList',
        '|',
        'undo', 'redo',
      ],
      image: imageConfig,
      ckeperusteet: {
        kasitteet: this.opsKasitteet,
        vue: this,
      },
    };
  }

  private getNormalSettings(uploadEnabled: boolean): object {
    return {
      language: this.locale,
      plugins: [
        ...commonPlugins,
        ...advancedCommonPlugins,
        ...uploadEnabled ? [ImageUpload] : [],
        LinkPlugin,
        Table,
        TableToolbar,
      ],
      toolbar: [
        'bold', 'italic', 'strikethrough',
        ...uploadEnabled ? ['|', 'imageUpload'] : [],
        '|',
        'bulletedList', 'numberedList',
        '|',
        'link', 'insertTable', 'insertKasite', 'insertMath',
        '|',
        'undo', 'redo',
      ],
      image: imageConfig,
      ckeperusteet: {
        kasitteet: this.opsKasitteet,
        vue: this,
      },
    };
  }

  // Tämä hoitaa tekstin kääntämisen plugineissa
  private translateString(text: string) {
    return this.$t(text);
  }
}
