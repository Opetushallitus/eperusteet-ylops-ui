import { Mixins, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@/components/forms/EpField.vue';
import EpRoute from '@/mixins/EpRoute';
import TekstikappaleTeksti from './teksti/TekstikappaleTeksti.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Puu } from '@/tyypit';
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
}
