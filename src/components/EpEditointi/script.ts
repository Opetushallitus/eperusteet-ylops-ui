import { Component, Mixins, Prop, Vue } from 'vue-property-decorator';
import { editointi, EditointiKontrolli, EditointiKontrolliConfig } from '@/stores/editointi';
import EpButton from '@/components/EpButton/EpButton.vue';
import '@/stores/kieli';
import { validationMixin } from 'vuelidate';

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

  public async mounted() {
    this.ctrls = editointi({ ...this.hooks });
    await this.ctrls.init();
    this.state = this.ctrls.state;
    this.isInitialized = true;
  }

}
