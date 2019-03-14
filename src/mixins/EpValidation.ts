import { Component, Prop, Vue } from 'vue-property-decorator';
import _ from 'lodash';

@Component
export default class EpValidation extends Vue {
  @Prop({ default: '' })
  private validMessage!: string;

  @Prop({ default: '' })
  private invalidMessage!: string;

  @Prop({ default: null })
  public validation!: any;

  get isInvalid() {
    return this.validation && this.validation.$invalid;
  }

  get isValid() {
    return this.validation && !this.validation.$invalid;
  }

  get validationError() {
    // Validointi näyteään vain muokkaustilassa
    if ((this as any).isEditing !== undefined && (this as any).isEditing && this.validation) {
      return _(this.validation)
        .keys()
        .reject((key) => _.startsWith(key, '$'))
        .reject((key) => this.validation[key])
        .head();
    }
    else {
      return '';
    }
  }
}
