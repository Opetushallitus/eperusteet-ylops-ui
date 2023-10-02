<template>
<div class="home-container">
  <div class="header">
    <ep-navigation :sticky="false" :tutoriaalistore="tutoriaalistore"></ep-navigation>
    <div class="container">
      <div class="container-fluid">
        <div class="row no-gutters">
          <div class="col my-4 px-3 px-md-0">
            <h1>{{ $t('lops-tyokalu-tervetuloa', { nimi }) }}</h1>
            <p>{{ $t('tervetuloa-kuvaus') }}</p>
          </div>
        </div>
      </div>
      <!--
      <div class="row">
         <div class="col-md-4 mb-3">
           <ep-search v-model="rajain"></ep-search>
         </div>
      </div>
      -->
    </div>
  </div>
  <div class="container tile-container">
    <div class="d-flex flex-row flex-wrap justify-content-center">
      <tile-opetussuunnitelmat
        :keskeneraiset="etusivu.opetussuunnitelmatKeskeneraiset"
        :julkaistut="etusivu.opetussuunnitelmatJulkaistut"
        :count-is-loading="isLoading" />
      <tile-opetussuunnitelmat
        :keskeneraiset="etusivu.pohjatKeskeneraiset"
        :julkaistut="etusivu.pohjatJulkaistut"
        :is-ops="false"
        v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'pohja' }"
        :count-is-loading="isLoading" />
      <tile-organisaatio />
      <tile-valtakunnalliset-perusteet />
      <tile-tiedotteet />
      <tile-ukk />
      <tile-oppaat />
      <tile-tilastot v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'pohja' }"/>
    </div>
  </div>

  <EpFeedbackModal :palauteProvider="palautteetStore"/>
</div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { Kayttajat } from '@/stores/kayttaja';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { EtusivuDto } from '@shared/api/ylops';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';

import EpRoute from '@/mixins/EpRoute';

import TileUkk from './tiles/TileUkk.vue';
import TileOpetussuunnitelmat from './tiles/TileOpetussuunnitelmat.vue';
import TileValtakunnallisetPerusteet from './tiles/TileValtakunnallisetPerusteet.vue';
import TileOrganisaatio from './tiles/TileOrganisaatio.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';
import TileTilastot from './tiles/TileTilastot.vue';
import TileOppaat from './tiles/TileOppaat.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpFeedbackModal from '@shared/components/EpFeedback/EpFeedbackModal.vue';
import { PalautteetStore } from '@/stores/PalautteetStore';

@Component({
  components: {
    EpNavigation,
    EpSearch,
    EpSpinner,
    TileOpetussuunnitelmat,
    TileOrganisaatio,
    TileTiedotteet,
    TileUkk,
    TileValtakunnallisetPerusteet,
    TileTilastot,
    EpFeedbackModal,
    TileOppaat,
  },
  directives: {
    oikeustarkastelu,
  },
})
export default class Home extends Mixins(EpRoute) {
  @Prop()
  private tutoriaalistore!: TutoriaaliStore;

  private rajain: string = '';
  private etusivu: EtusivuDto = {
    opetussuunnitelmatKeskeneraiset: 0,
    opetussuunnitelmatJulkaistut: 0,
    pohjatKeskeneraiset: 0,
    pohjatJulkaistut: 0,
  };
  private palautteetStore = new PalautteetStore();

  async init() {
    this.etusivu = await Kayttajat.getEtusivu();
  }

  get nimi() {
    return Kayttajat.nimi;
  }

  get kayttaja() {
    return Kayttajat.tiedot;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.home-container {
  background-color: $etusivu-background;
  overflow: auto;

  .header {
    h1 {
      font-weight: 300;
    }
    background-color: $etusivu-header-background;
    background-image: url('~@assets/img/banners/header_ylops.svg');
    background-position: 100% 0;
    background-repeat: no-repeat;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }

    color: white;
  }

  .tile-container {
    padding: 0;
    margin-top: 30px;
    margin-bottom: 30px;
  }
}
</style>
