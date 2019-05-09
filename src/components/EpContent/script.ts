import { Component, Mixins, Prop } from 'vue-property-decorator';
import _ from 'lodash';
import EpContentBase from '@/components/EpContentBase/EpContentBase.vue';
import EpValidation from '@/mixins/EpValidation';

import { Termisto } from '@/api';
import { EditorLayout, TermiDto } from '@/tyypit';
import { Kielet } from '@/stores/kieli';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

@Component({
  components: {
    EpContentBase,
  },
})
export default class EpContent extends Mixins(EpValidation) {
  @Prop({ default: true })
  private lokalisoitu!: boolean;

  @Prop({ required: true })
  private value!: string | object;

  // CkEditorin layout (määrittää editorin ominaisuudet)
  @Prop({ default: 'normal' })
  private layout!: EditorLayout;

  @Prop({ default: false })
  private isEditable!: boolean;

  @Prop({ default: '' })
  private help!: string;

  private termisto: TermiDto[] = [];

  async created() {
    try {
      // Ladataan kaikki käsitteet
      const resp = await Termisto.getAllTermit(this.opsId);
      this.termisto = resp.data;
    }
    catch (err) {
      // Todo: Termien lataus epäonnistui
    }
  }

  get opsId() {
    return _.get(Opetussuunnitelma, 'opetussuunnitelma.id', 0);
  }

  get opsKasitteet() {
    const kieli = Kielet.getSisaltoKieli();

    // Muodostetaan käsitteistä map nykyisen sisältökielen tiedoilla
    return this.termisto.reduce((o, kasite) => {
      const title = _.get(kasite, `termi.${kieli}`, '');
      const content = _.get(kasite, `selitys.${kieli}`, '');
      const avain = _.get(kasite, 'avain', null);
      return avain === null ? {} : Object.assign(o, {
        [avain]: { title, content }
      });
    }, {});
  }

  get locale() {
    return Kielet.getUiKieli();
  }

  get contentValue() {
    if (!this.value) {
      return '';
    }
    else if (this.lokalisoitu) {
      const kieli = Kielet.getSisaltoKieli();
      return (this.value as any)[kieli];
    }
    else {
      return this.value;
    }
  }

  private handleContentChange(content: string) {
    if (this.lokalisoitu) {
      const kieli = Kielet.getSisaltoKieli();
      const value = (_.isPlainObject(this.value) ? this.value : {}) as object;
      this.$emit('input', {
        ...value,
        [kieli]: content,
      });
    }
    else {
      this.$emit('input', content);
    }
  }
}
