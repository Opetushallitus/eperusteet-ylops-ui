import { Prop, Component } from 'vue-property-decorator';
import EpRoute from './EpRoute';
import { OpetussuunnitelmaStore, Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import _ from 'lodash';


/**
 * Mixin näkymäkomponenteille mitkä tarvitsevat opetussuunnitelman sisällön
 */
@Component
export default class EpOpsRoute extends EpRoute {
  @Prop({ required: true })
  private opetussuunnitelmaStore!: OpetussuunnitelmaStore;

  get store() {
    return this.opetussuunnitelmaStore;
  }

  get ops() {
    return this.store.opetussuunnitelma!;
  }

  get opsId() {
    return this.store.opetussuunnitelma!.id!;
  }

  get isPohja() {
    return this.store.opetussuunnitelma!.tyyppi as string === 'pohja';
  }

  get isOps() {
    return this.store.opetussuunnitelma!.tyyppi as string === 'ops';
  }

  get isValmisPohja() {
    return this.isPohja && this.ops.tila as any === 'valmis';
  }

}
