import { Vue, Prop, Component } from 'vue-property-decorator';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';


/**
 * Mixin näkymäkomponenteille mitkä tarvitsevat opetussuunnitelman sisällön
 */
@Component
export default class EpOpsComponent extends Vue {
  @Prop({ required: true })
  private opetussuunnitelmaStore!: OpetussuunnitelmaStore;

  get store() {
    return this.opetussuunnitelmaStore!;
  }

  get ops() {
    return this.store.opetussuunnitelma!;
  }

  get opsId() {
    return this.ops.id!;
  }

  get isPohja() {
    return this.ops.tyyppi as string === 'pohja';
  }

  get isOps() {
    return this.ops.tyyppi as string === 'ops';
  }

  get isValmisPohja() {
    return this.isPohja && this.ops.tila as any === 'valmis';
  }

}

