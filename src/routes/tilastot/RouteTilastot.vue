<template>
<ep-main-view :tutoriaalistore="tutoriaalistore">
  <template slot="icon">
    <ep-icon class="float-right" icon="tiedotteet" background-color="#000000">
    </ep-icon>
  </template>
  <template slot="header">
    <h1>{{ $t('ops-tilastot') }}</h1>
  </template>
  <template slot="custom-content">
    <ep-spinner v-if="isLoading">
    </ep-spinner>
    <div class="row" v-else>

      <div class="col-6 tilastotyyppi" v-for="(avain,i) in avaimet(statistiikka)" :key="i">
        <div class="otsake">{{$t(avain)}}</div>
        <div v-for="(tyyppi, i) in tyypit(statistiikka, avain)" :key="i">
          <div class="row" v-for="(avain, i) in avaimet(tyyppi)" :key="i">
            <div class="col-5">{{$t(avain)}}:</div> <div class="col-2 text-right">{{tyyppi[avain]}}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
</ep-main-view>
</template>

<script lang="ts">
import { Prop, Vue, Component, Mixins } from 'vue-property-decorator';
import * as _ from 'lodash';

import EpButton from'@shared/components/EpButton/EpButton.vue';
import EpCollapse from'@/components/EpCollapse/EpCollapse.vue';
import EpContent from'@/components/EpContent/EpContent.vue';
import EpIcon from'@/components/EpIcon/EpIcon.vue';
import EpMainView from'@/components/EpMainView/EpMainView.vue';
import EpNavigation from'@/components/EpNavigation/EpNavigation.vue';
import EpRoute from '@/mixins/EpRoot';
import EpSearch from'@shared/components/forms/EpSearch.vue';
import EpSpinner from'@shared/components/EpSpinner/EpSpinner.vue';
import EpLinkki from '@shared/components/EpLinkki/EpLinkki.vue';

import { Opetussuunnitelmat } from '@/api';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import { OpetussuunnitelmaStatistiikkaDto } from '@/tyypit';


@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpLinkki,
    EpButton,
    EpCollapse,
    EpContent,
    EpIcon,
    EpMainView,
    EpNavigation,
    EpSearch,
    EpSpinner,
  },
})
export default class RouteTilastot extends Mixins(EpRoute) {

  private statistiikka: OpetussuunnitelmaStatistiikkaDto | null = null;

  async init() {
    this.statistiikka = (await Opetussuunnitelmat.getStatistiikka()).data;
  }

  avaimet(obj) {
    return _.keys(obj);
  }

  tyypit(obj, avain) {
    return _.pick(obj, avain);
  }



}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .tilastotyyppi {
    margin-top: 20px;
    margin-bottom: 20px;

    .otsake {
      margin-bottom:20px;
      border-bottom: 1px solid $gray-lighten-4;
    }

  }

</style>
