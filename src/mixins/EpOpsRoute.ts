import { Watch, Vue, Component } from 'vue-property-decorator';
import _ from 'lodash';
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

  get isPohja() {
    return Opetussuunnitelma.opetussuunnitelma!.tyyppi as string === 'pohja';
  }

  get isOps() {
    return Opetussuunnitelma.opetussuunnitelma!.tyyppi as string === 'ops';
  }

}

