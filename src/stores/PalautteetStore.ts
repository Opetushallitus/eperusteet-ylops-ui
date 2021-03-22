import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import * as _ from 'lodash';
import { ITPalauteProvider, Palaute } from '@shared/stores/types';
import { EperusteetPalautekanava } from '@shared/tyypit';
import { Palautteet } from '@shared/api/ylops';

Vue.use(VueCompositionApi);
export class PalautteetStore implements ITPalauteProvider {
  public readonly tutkintorakennepalaute = computed(() => false);

  async sendPalaute(palaute: Palaute) {
    palaute.key = EperusteetPalautekanava.ylops;
    await Palautteet.sendPalaute(palaute);
  }
}
