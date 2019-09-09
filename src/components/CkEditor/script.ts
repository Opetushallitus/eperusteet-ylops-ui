import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import { EditorLayout } from '@/tyypit';
import EpValidation from '@/mixins/EpValidation';
import { createLogger } from '@/stores/logger';

const logger = createLogger('CkEditor');

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

  // OPS:n käsitteet (käsitemodulia varten)
  @Prop({ default: () => ({}) })
  private opsKasitteet!: object;

  private lastEmittedValue: string = '';
  private editorValue: string = '';

  @Watch('value')
  private onValueChanged(newValue: string) {
    if (newValue === this.lastEmittedValue) {
      return;
    }

    // Päivitetään editoriin uusi arvo
    this.editorValue = newValue || '';
  }

  private get config() {
    let toolbarLayout: object;

    switch (this.layout) {
    case 'normal':
      toolbarLayout = this.getNormalToolbar();
      break;
    case 'simplified':
      toolbarLayout = this.getSimplifiedToolbar();
      break;
    default:
      throw new Error(`${this.layout} is not valid layout`);
    }

    return {
      toolbar: toolbarLayout,
      removePlugins: 'resize,elementspath,scayt,wsc,image',
      //extraPlugins: "divarea,quicktable,mathjax",
      disallowedContent: 'br; tr td{width,height}',
      extraAllowedContent: 'img[!data-uid,src]; abbr[data-viite]',
      disableObjectResizing: true,
      language: this.locale,
      entities: false,
      entities_latin: false,
      title: false,
      //mathJaxLib: "//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.6/MathJax.js?config=TeX-AMS_HTML",
    };
  }

  private getSimplifiedToolbar() {
    return [
      { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo'] },
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', '-', 'RemoveFormat'] },
      { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-'] },
      { name: 'tools', items: ['About'] }
    ];
  }

  private getNormalToolbar() {
    return [
      { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', '-', 'RemoveFormat'] },
      { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Blockquote'] },
      { name: 'insert', items: ['Table', 'HorizontalRule', 'SpecialChar', 'Link', 'Termi', 'epimage'] },
      { name: 'tools', items: ['About'] }
    ];
  }
}
