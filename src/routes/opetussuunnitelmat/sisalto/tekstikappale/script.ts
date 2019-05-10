import { Mixins, Component } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoute';
import TekstikappaleTeksti from './teksti/TekstikappaleTeksti.vue';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

@Component({
  components: {
    TekstikappaleTeksti,
  },
})
export default class RouteTekstikappale extends Mixins(EpRoute) {
  get isPohja() {
    return Opetussuunnitelma.opetussuunnitelma!.tyyppi as string === 'pohja';
  }

  private get breadcrumb() {
    return this.ops!.nimi;
  }

}
