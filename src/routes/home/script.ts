import { Component, Vue } from 'vue-property-decorator';

import { Kayttajat } from '@/stores/kayttaja';

import TileUkk from './tiles/TileUkk.vue';
import TileOpetussuunnitelmat from './tiles/TileOpetussuunnitelmat.vue';
import TileValtakunnallisetPerusteet from './tiles/TileValtakunnallisetPerusteet.vue';
import TileUusiOpetussuunnitelma from './tiles/TileUusiOpetussuunnitelma.vue';
import TileUusiPohja from './tiles/TileUusiPohja.vue';
import TileLoki from './tiles/TileLoki.vue';
import TileOrganisaatio from './tiles/TileOrganisaatio.vue';
import TilePohjat from './tiles/TilePohjat.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';

import {
  EpAikaleima,
  EpNavigation,
  EpContent,
  EpSearch,
} from '@/components';

@Component({
  components: {
    EpAikaleima,
    EpContent,
    EpNavigation,
    EpSearch,
    TileUkk,
    TileLoki,
    TileOpetussuunnitelmat,
    TileOrganisaatio,
    TilePohjat,
    TileTiedotteet,
    TileUusiOpetussuunnitelma,
    TileUusiPohja,
    TileValtakunnallisetPerusteet,
  },
})
export default class Home extends Vue {

  private rajain: string = '';

  private get nimi() {
    return Kayttajat.nimi();
  }

  private get kayttaja() {
    return Kayttajat.tiedot;
  }
}
