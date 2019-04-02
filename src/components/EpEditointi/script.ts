import { Watch, Component, Mixins, Prop, Vue } from 'vue-property-decorator';
import { editointi, EditointiKontrolli, EditointiKontrolliConfig } from '@/stores/editointi';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpVersioModaali from './EpVersioModaali.vue';
import '@/stores/kieli';
import { validationMixin } from 'vuelidate';
import _ from 'lodash';

export { EditointiKontrolliConfig } from '@/stores/editointi';

@Component({
  validations() {
    return {
      state: {
        data: {
          ...(this as any).validator,
        },
      },
    };
  },
  components: {
    EpButton,
    EpVersioModaali,
  },
})
export default class EpEditointi extends Mixins(validationMixin) {
  @Prop({ required: true })
  private hooks!: EditointiKontrolliConfig;

  @Prop({ default: null })
  private validator!: any | null;

  private ctrls: EditointiKontrolli | null = null;
  private state: any = null;
  private isInitialized = false;

  @Watch('state.data')
  private changed(newValue: any, oldValue: any) {
    this.$emit('input', newValue);
  }

  public async mounted() {
    this.ctrls = editointi({ ...this.hooks });
    await this.ctrls.init();
    this.state = this.ctrls.state;
    this.isInitialized = true;
  }

  get current() {
    return _.first(this.historia);
  }

  get latest() {
    return _.first(this.historia);
  }

  get historia() {
    const revs = this.ctrls!.state!.revisions || [];
    return _.map(this.ctrls!.state!.revisions, (rev, index) => ({
      ...rev,
      index: revs.length - index,
    }));
  }
}
