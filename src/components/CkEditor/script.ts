import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import _ from 'lodash';

import InlineEditor from 'eperusteet-frontend-utils/ckeditor5-build-inline';
import 'eperusteet-frontend-utils/ckeditor5-build-inline/build/translations/sv';
import 'eperusteet-frontend-utils/ckeditor5-build-inline/build/translations/en';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';
import { createLogger } from '@/stores/logger';
import { EpUploadAdapter } from './adapter'

const logger = createLogger('CkEditor');

const INPUT_EVENT_DEBOUNCE_WAIT = 300;

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
  @Prop({ default: null })
  private opsId!: number | null;

  // OPS:n käsitteet (käsitemodulia varten)
  @Prop({ default: () => ({}) })
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

  @Watch('opsId')
  private onOpsIdChanged(val: number, oldval: number) {
    this.instance.destroy();
    this.createEditorInstance();
  }

  @Watch('layout')
  private onLayoutChanged(val: EditorLayout, oldval: EditorLayout) {
    this.instance.destroy();
    this.createEditorInstance();
  }

  @Watch('value')
  private onValueChanged(newValue: string, oldValue: string) {
    if (newValue === this.lastEmittedValue) {
      return;
    }

    // Päivitetään editoriin uusi arvo
    this.instance.setData(newValue || '');
  }

  private get config() {
    let config: object;

    switch (this.layout) {
    case 'normal':
      if (this.opsId) {
        config = this.normalWithImagesSettings;
      } else {
        config = this.normalSettings;
      }
      break;
    case 'simplified':
      config = this.simplifiedSettings;
      break;
    default:
      throw new Error(`${this.layout} is not valid layout`);
    }

    return config;
  }

  private async createEditorInstance() {
    try {
      this.instance = await InlineEditor.create(this.$refs.ckeditor, this.config);

      if (this.opsId) {
        this.instance.plugins.get('FileRepository').createUploadAdapter = (loader) => {
          return new EpUploadAdapter(loader, {
            opsId: this.opsId,
            //name: custom input
          });
        };
      }

      this.instance.setData(this.value);
      this.setEditorEvents();

      this.$emit('ready', this.instance);
    }
    catch (err) {
      logger.error(err);
    }
  }

  private setEditorEvents() {
    const editor = this.instance;

    editor.model.document.on('change:data', _.debounce(event => {
      const data = editor.getData();
      this.lastEmittedValue = data;
      this.$emit('input', data, event, editor);
    }, INPUT_EVENT_DEBOUNCE_WAIT));
  }

  private get simplifiedSettings() {
    return {
      language: this.locale,
      toolbar: {
        items: [
          'bold', 'italic', 'strikethrough',
          '|',
          'bulletedList', 'numberedList',
          '|',
          'undo', 'redo',
        ],
      },
    };
  }

  private get normalSettings() {
    return {
      language: this.locale,
      toolbar: [
        'bold', 'italic', 'strikethrough',
        '|',
        'bulletedList', 'numberedList', 'blockQuote',
        '|',
        'insertTable',
        'link',
        '|',
        'undo', 'redo',
      ],
    };
  }

  private get normalWithImagesSettings() {
    return {
      language: this.locale,
      toolbar: [
        'bold', 'italic', 'strikethrough',
        '|',
        'bulletedList', 'numberedList', 'blockQuote',
        '|',
        'insertTable',
        'link',
        'imageUpload',
        '|',
        'undo', 'redo',
      ],
      image: {
        toolbar: [
          'imageTextAlternative'
        ],
        styles: [
          'full'
        ]
      },
    };
  }
}
