import { Component, Mixins, Prop, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import EpContentBase from '@/components/EpContentBase/EpContentBase.vue';
import EpValidation from '@/mixins/EpValidation';

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

  @Prop({ default: false })
  private isEditable!: boolean;

  @Prop({ default: '' })
  private help!: string;

  get opsId() {
    return _.get(Opetussuunnitelma, 'opetussuunnitelma.id', 0);
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
