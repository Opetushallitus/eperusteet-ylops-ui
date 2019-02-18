import { Component, Prop, Vue } from 'vue-property-decorator';
import { editointi, EditointiKontrolli, EditointiKontrolliConfig } from '@/stores/editointi';
import EpButton from '@/components/EpButton/EpButton.vue';
import '@/stores/kieli';

export { EditointiKontrolliConfig } from '@/stores/editointi';


@Component({
  components: {
    EpButton,
  },
})
export default class EpEditointi extends Vue {
  @Prop({ required: true })
  private hooks!: EditointiKontrolliConfig;

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
