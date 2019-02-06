import { Component, Vue } from 'vue-property-decorator';

import { Opetussuunnitelmat } from '@/api';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';

import { Kayttajat } from '@/stores/kayttaja';

import EpAikaleima from '@/components/EpAikaleima/EpAikaleima.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import TileFaq from './tiles/TileFaq.vue';
import TileOpetussuunnitelmat from './tiles/TileOpetussuunnitelmat.vue';
import TileValtakunnallisetPerusteet from './tiles/TileValtakunnallisetPerusteet.vue';
import TileUusiOpetussuunnitelma from './tiles/TileUusiOpetussuunnitelma.vue';
import TileUusiPohja from './tiles/TileUusiPohja.vue';
import TileLoki from './tiles/TileLoki.vue';
import TileOrganisaatio from './tiles/TileOrganisaatio.vue';
import TilePohjat from './tiles/TilePohjat.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';


@Component({
  components: {
    EpAikaleima,
    EpContent,
    TileFaq,
    TileOpetussuunnitelmat,
    TileValtakunnallisetPerusteet,
    TileUusiOpetussuunnitelma,
    TileUusiPohja,
    TileLoki,
    TileOrganisaatio,
    TilePohjat,
    TileTiedotteet,
  },
})
export default class Home extends Vue {
  private get nimi() {
    return Kayttajat.nimi();
  }

  private get kayttaja() {
    return Kayttajat.tiedot;
  }

}
