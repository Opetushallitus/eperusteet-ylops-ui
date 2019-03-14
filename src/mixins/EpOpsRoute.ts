import { Component } from 'vue-property-decorator';
import EpRoute from './EpRoute';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

/**
 * Mixin näkymäkomponenteille mitkä tarvitsevat opetussuunnitelman sisällön
 */
@Component
export default class EpOpsRoute extends EpRoute {
  get ops() {
    return Opetussuunnitelma.opetussuunnitelma!;
  }

  get opsId() {
    return Opetussuunnitelma.opetussuunnitelma!.id!;
  }

  get isPohja() {
    return Opetussuunnitelma.opetussuunnitelma!.tyyppi as string === 'pohja';
  }

  get isOps() {
    return Opetussuunnitelma.opetussuunnitelma!.tyyppi as string === 'ops';
  }
}
