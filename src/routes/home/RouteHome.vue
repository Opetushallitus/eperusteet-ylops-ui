<template>
<div class="home-container">
    <div class="header">
        <ep-navigation :sticky="false"></ep-navigation>
        <div class="container">
            <h1>{{ $t('tervetuloa', { nimi }) }}</h1>
            <p>{{ $t('tervetuloa-kuvaus') }}</p>
            <div class="row">
                <div class="col-md-4">
                    <ep-search v-model="rajain"></ep-search>
                </div>
            </div>
        </div>
    </div>
    <div class="container tile-container">
        <div class="d-flex flex-row flex-wrap justify-content-center">
            <tile-opetussuunnitelmat
              :keskeneraiset="etusivu.opetussuunnitelmatKeskeneraiset"
              :julkaistut="etusivu.opetussuunnitelmatJulkaistut" />
            <tile-opetussuunnitelmat
              :keskeneraiset="etusivu.pohjatKeskeneraiset"
              :julkaistut="etusivu.pohjatJulkaistut"
              :is-ops="false"
              v-oikeustarkastelu="'hallinta'" />
            <tile-organisaatio />
            <tile-valtakunnalliset-perusteet />
            <tile-tiedotteet />
            <tile-ukk />
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator';

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
import EpRoute from '@/mixins/EpRoute';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { EtusivuDto } from '@/tyypit';
import ImageModal from '@/components/TiptapExtensions/ImageModal.vue';
import { IAttachmentWrapper, createLiitetiedostoHandler } from '@/stores/kuvat';


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
    TileLoki,
    TileOpetussuunnitelmat,
    TileOrganisaatio,
    TilePohjat,
    TileTiedotteet,
    TileUkk,
    TileUusiOpetussuunnitelma,
    TileUusiPohja,
    TileValtakunnallisetPerusteet,
  },
  directives: {
    oikeustarkastelu,
  },
})
export default class Home extends Mixins(EpRoute) {
  private rajain: string = '';
  private etusivu: EtusivuDto = {
    opetussuunnitelmatKeskeneraiset: 0,
    opetussuunnitelmatJulkaistut: 0,
    pohjatKeskeneraiset: 0,
    pohjatJulkaistut: 0,
  };

  async init() {
    this.etusivu = await Kayttajat.getEtusivu();
  }

  private get nimi() {
    return Kayttajat.nimi();
  }

  private get kayttaja() {
    return Kayttajat.tiedot;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.home-container {
  background-color: $etusivu-background;
  overflow: auto;

  .header {
    h1 {
      font-weight: 300;
    }
    background-color: $etusivu-header-background;
    background-image: url('../../../public/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: no-repeat;

    color: white;
  }

  .tile-container {
    padding: 0;
    margin-top: 30px;
    margin-bottom: 30px;
  }
}
</style>
