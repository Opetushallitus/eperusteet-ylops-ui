import { Component, Prop, Vue } from 'vue-property-decorator';
import { editointi, EditointiKontrolli, EditointiKontrolliConfig } from '@/stores/editointi';
import '@/stores/kieli';

@Component
export default class EpEditointi extends Vue {
  @Prop({ required: true })
  private hooks!: EditointiKontrolliConfig;

  private ctrls: EditointiKontrolli | null = null;

  public mounted() {
    this.ctrls = editointi(this.hooks);
  }

}
