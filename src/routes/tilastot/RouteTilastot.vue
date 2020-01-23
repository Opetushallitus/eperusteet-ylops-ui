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

        <div class="col-6 tilastotyyppi" v-for="(tilastotieto,i) in statistiikkaData" :key="i">
          <div class="otsake">{{$t(tilastotieto.otsikko)}}</div>
          <apexchart type="pie" :options="tilastotieto.graafiAvaimet" :series="tilastotieto.graafiData"></apexchart>
        </div>
      </div>

      <b-table responsive
              borderless
              striped
              fixed
              :items="opetussuunnitelmat"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage">

        <template v-slot:cell(nimi)="data">
          {{ $kaanna(data.value) }}
        </template>

        <template v-slot:cell(koulutustyyppi)="data">
          {{ $t(data.value) }}
        </template>

        <template v-slot:cell(tila)="data">
          {{ $t(data.value) }}
        </template>

      </b-table>

      <b-pagination
        v-model="currentPage"
        :total-rows="opetussuunnitelmat.length"
        :per-page="perPage"
        aria-controls="opetussuunnitelmat"
        align="center">
      </b-pagination>


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
import { OpetussuunnitelmaStatistiikkaDto,OpetussuunnitelmaInfoDto } from '@/tyypit';


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

  @Prop()
  private tutoriaalistore!: TutoriaaliStore;

  private statistiikka: OpetussuunnitelmaStatistiikkaDto | null = null;
  private opetussuunnitelmat: OpetussuunnitelmaInfoDto[] = [];

  private currentPage = 1;
  private perPage = 10;

  async init() {
    this.statistiikka = (await Opetussuunnitelmat.getStatistiikka()).data;
    this.opetussuunnitelmat = (await Opetussuunnitelmat.getAdminList()).data;
  }

  get statistiikkaData() {

    return _.map(_.keys(this.statistiikka), avain => {
      return {
        otsikko: avain,
        graafiAvaimet: this.chartOptions(avain),
        graafiData: this.series(avain),
      };
    });
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
    }, {
      key: 'koulutustyyppi',
      label: this.$t('koulutustyyppi'),
      sortable: true,
    }, {
      key: 'tila',
      label: this.$t('tila'),
      sortable: true,
    }];
  }

  chartOptions(avain) {
    return {
      labels: _.map(_.keys(this.statistiikka![avain]), (avain) => this.$t(avain)),
    };
  }

  series(avain) {
    return _.values(this.statistiikka![avain]);
  }

  get kaikkiGraafiOptions() {
    return {
      chart: {
        stacked: true,
      },
      xaxis: {
        categories:_.map(_.keys(this.statistiikka), (avain) => this.$t(avain)),
      }
    };
  }

  get kaikkiGraafiSeries() {
    return [];
    // _.map(_.keys(this.statistiikka), (avain) => {
    //   return {

    //   }
    // }

    // return [{data:_.values(this.statistiikka![avain])}];
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
