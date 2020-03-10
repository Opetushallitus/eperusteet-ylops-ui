<template>
  <ep-main-view :tutoriaalistore="tutoriaalistore">
    <template slot="icon">
      <ep-icon class="float-right" icon="taulukko" background-color="#000000">
      </ep-icon>
    </template>
    <template slot="header">
      <h1>{{ $t('ops-tilastot') }}</h1>
    </template>
    <template slot="custom-content">
      <ep-spinner v-if="isLoading">
      </ep-spinner>

      <div class="mt-5" v-else >

        <div class="row">
          <div class="col-xl-3 col-md-6 col-sm-12">
            <ep-form-content name="nimi">
              <ep-search v-model="query" />
            </ep-form-content>
          </div>

          <div class="col-xl-3 col-md-6 col-sm-12">
            <ep-form-content name="koulutustyyppi">
              <ep-multi-select :multiple="true"
                :is-editing="true"
                :options="koulutustyyppiItems"
                v-model="valitutKoulutustyypit"
                :placeholder="$t('kaikki')"
                track-by="value"
                label="text">
              </ep-multi-select>
            </ep-form-content>
          </div>

          <div class="col-xl-3 col-md-6 col-sm-12">
            <ep-form-content name="tila">
              <ep-multi-select :multiple="true"
                :is-editing="true"
                :options="tilaItems"
                v-model="valitutTilat"
                :placeholder="$t('kaikki')"
                track-by="value"
                label="text">
              </ep-multi-select>
            </ep-form-content>
          </div>

          <div class="col-xl-3 col-md-6 col-sm-12">
            <ep-form-content name="voimassaolo">
              <ep-multi-select :multiple="true"
                :is-editing="true"
                :options="voimassaoloItems"
                v-model="valitutVoimassaolot"
                :placeholder="$t('kaikki')"
                track-by="value"
                label="text">
              </ep-multi-select>
            </ep-form-content>
          </div>

          <div class="col-xl-9 col-md-9 col-sm-12">
            <ep-form-content name="peruste">
              <ep-multi-select :multiple="true"
                :is-editing="true"
                :options="perusteItems"
                v-model="valitutPerusteet"
                :placeholder="$t('kaikki')"
                track-by="value"
                label="text">
              </ep-multi-select>
            </ep-form-content>
          </div>
        </div>

        <h2 class="mt-4">{{$t('opetussuunnitelmien-lukumaarat')}}</h2>

        <div class="row">
          <div class="col-xl-4 col-md-6 col-sm-12 tilastotyyppi" v-for="(tilastotieto,i) in statistiikkaData" :key="i">
            <div class="otsake">{{$t(tilastotieto.otsikko)}}</div>
            <apexchart type="donut" :options="tilastotieto.graafiAvaimet" :series="tilastotieto.graafiData" v-if="!opetussuunnitelmatEmpty"/>
            <apexchart type="donut" :options="tyhjaGraafiOptions" :series="tyhjaGraafiData" v-else/>
          </div>
        </div>

        <h2 class="mt-5">{{$t('opetussuunnitelmat')}}</h2>

        <b-table responsive
                borderless
                striped
                fixed
                :items="opetussuunnitelmatFiltered"
                :fields="tableFields"
                :current-page="currentPage"
                :per-page="perPage">

          <template v-slot:cell(nimi)="data">
            {{ data.value }}
          </template>

          <template v-slot:cell(koulutustyyppi)="data">
            {{ $t(data.value) }}
          </template>

          <template v-slot:cell(tila)="data">
            {{ $t(data.value) }}

             <ep-button
                v-if="data.value === 'poistettu'"
                variant="link"
                icon="peruuta"
                @click="palauta(data.item)"
                buttonClass="mb-1">
              {{$t('palauta')}}
            </ep-button>
          </template>

          <template v-slot:cell(perusteenVoimassaoloAlkaa)="data">
            {{ $sd(data.value) }}
          </template>

          <template v-slot:cell(perusteenVoimassaoloLoppuu)="data">
            {{ $sd(data.value) }}
          </template>

        </b-table>

        <b-pagination
          v-model="currentPage"
          :total-rows="opetussuunnitelmatFiltered.length"
          :per-page="perPage"
          aria-controls="opetussuunnitelmat"
          align="center">
        </b-pagination>

      </div>

    </template>
  </ep-main-view>
</template>

<script lang="ts">
import { Prop, Vue, Component, Mixins } from 'vue-property-decorator';
import * as _ from 'lodash';

import EpButton from'@shared/components/EpButton/EpButton.vue';
import EpContent from'@/components/EpContent/EpContent.vue';
import EpIcon from'@/components/EpIcon/EpIcon.vue';
import EpMainView from'@/components/EpMainView/EpMainView.vue';
import EpRoute from '@/mixins/EpRoot';
import EpSearch from'@shared/components/forms/EpSearch.vue';
import EpSpinner from'@shared/components/EpSpinner/EpSpinner.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { Opetussuunnitelmat, Ulkopuoliset } from '@shared/api/ylops';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import { OpetussuunnitelmaInfoDto, PerusteInfoDto } from '@shared/api/ylops';
import { YlopsKoulutustyypit } from '@/utils/perusteet';
import { Kielet } from '@shared/stores/kieli';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { success, fail } from '@/utils/notifications';

@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpButton,
    EpContent,
    EpIcon,
    EpMainView,
    EpSearch,
    EpSpinner,
    EpFormContent,
    EpMultiSelect,
  },
})
export default class RouteTilastot extends Mixins(EpRoute) {

  @Prop()
  private tutoriaalistore!: TutoriaaliStore;
  private opetussuunnitelmat: OpetussuunnitelmaInfoDto[] = [];
  private perusteet: PerusteInfoDto[] = [];

  private currentPage = 1;
  private perPage = 10;
  private query = '';
  private valitutTilat: [] = [];
  private valitutKoulutustyypit: [] = [];
  private valitutVoimassaolot: [] = [];
  private valitutPerusteet: [] = [];

  async init() {
    const res = _.map(await Promise.all([Opetussuunnitelmat.getAdminList(), await Ulkopuoliset.getPerusteet()]), (res: any) => res.data);
    [this.opetussuunnitelmat, this.perusteet] = res;
  }

  get opetussuunnitelmatFiltered() {
    return _.chain(this.opetussuunnitelmat)
      .filter(ops => _.isEmpty(this.valitutTilat) || _.includes(_.map(this.valitutTilat, 'value'), ops.tila))
      .filter(ops => _.isEmpty(this.valitutKoulutustyypit) || _.includes(_.map(this.valitutKoulutustyypit, 'value'), ops.koulutustyyppi))
      .filter(ops => Kielet.search(this.query, ops.nimi))
      .filter(ops => _.isEmpty(this.valitutVoimassaolot) || _.includes(_.map(this.valitutVoimassaolot, 'value'), this.opetussuunnitelmaVoimassaolo(ops)))
      .filter(ops => _.isEmpty(this.valitutPerusteet) || _.includes(_.map(this.valitutPerusteet, 'value') , ops.perusteenId))
      .sortBy(ops => Kielet.kaanna(ops.nimi))
      .value();
  }

  opetussuunnitelmaVoimassaolo(ops) {
    if (ops.perusteenVoimassaoloLoppuu != null && ops.perusteenVoimassaoloLoppuu < new Date()) {
      return 'paattynyt';
    }

    if (ops.perusteenVoimassaoloAlkaa > new Date()) {
      return 'tuleva';
    }

    return 'voimassaoleva';
  }

  get opetussuunnitelmatEmpty() {
    return _.isEmpty(this.opetussuunnitelmatFiltered);
  }

  get statistiikkaData() {
    return _.map(_.keys(this.statistiikka), otsikko => {
      return {
        otsikko: otsikko,
        graafiAvaimet: this.chartOptions(otsikko),
        graafiData: this.series(otsikko),
      };
    });
  }

  get statistiikka() {
    return {
      koulutustyypeittain: _.groupBy(this.opetussuunnitelmatFiltered, 'koulutustyyppi'),
      tiloittain: _.groupBy(this.opetussuunnitelmatFiltered, 'tila'),
      kielittain: _.omitBy({
        fi: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'fi')),
        sv: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'sv')),
        en: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'en')),
        se: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.includes(ops.julkaisukielet as any, 'se')),
      }, _.isEmpty),
      tasoittain: _.omitBy({
        seutukunnat: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.size(ops.kunnat) > 1),
        kunnat: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.size(ops.kunnat) === 1),
        koulujoukko: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.size(_.filter(ops.organisaatiot, (org) => _.size(org.tyypit) > 0 && _.head(org.tyypit) === 'Oppilaitos')) > 1),
        koulut: _.filter(this.opetussuunnitelmatFiltered, (ops) => _.size(_.filter(ops.organisaatiot, (org) => _.size(org.tyypit) > 0 && _.head(org.tyypit) === 'Oppilaitos')) === 1),
      }, _.isEmpty),
      perusteittain: _.groupBy(this.opetussuunnitelmatFiltered, 'perusteenId'),
    };
  }

  get tableFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      sortable: true,
      sortByFormatted: true,
      formatter: (value, key, item) => {
        return (this as any).$kaanna(value);
      },
    }, {
      key: 'koulutustyyppi',
      label: this.$t('koulutustyyppi'),
      sortable: true,
      thStyle: { width: '20%'},
    }, {
      key: 'tila',
      label: this.$t('tila'),
      sortable: true,
      thStyle: { width: '20%'},
    }, {
      key: 'perusteenVoimassaoloAlkaa',
      label: this.$t('voimassaolo-alkaa'),
      sortable: true,
      thStyle: { width: '15%'},
    }, {
      key: 'perusteenVoimassaoloLoppuu',
      label: this.$t('voimassaolo-paattyy'),
      sortable: true,
      thStyle: { width: '15%'},
    }];
  }

  chartLegends(otsikko) {
    if(otsikko != 'perusteittain') {
      return _.map(_.keys(this.statistiikka![otsikko]), (alaotsikko) => this.$t(alaotsikko));
    }
    else {
      const perusteet = _.keyBy(this.perusteet, 'id');
      return _.map(_.keys(this.statistiikka![otsikko]), (alaotsikko) => perusteet[alaotsikko] ? (this as any).$kaanna(perusteet[alaotsikko].nimi) : this.$t('null'));
    }
  }

  chartOptions(otsikko) {
    return {
      labels: this.chartLegends(otsikko),
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#000'],
          fontWeight: '400'
        },
        dropShadow: {
          enabled: false,
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        show: (otsikko !== 'perusteittain' || !_.isEmpty(this.valitutPerusteet)),
        formatter: function(seriesName, opts) {
          return [seriesName, ': ', opts.w.globals.series[opts.seriesIndex]];
        }
      },
      tooltip: {
        enabled: true,
      },
      colors: ['#82D4FF', '#9DDF72', '#FFD900', '#F166C0', '#B2B2B2', '#99B3F1', '#7CD443', '#FACCEA', '#CDEEFF', '#C126B8'],
    };
  }

  series(avain) {
    return _.map(this.statistiikka![avain], (value) => _.size(value));
  }

  get koulutustyyppiItems(){
    return _.map(YlopsKoulutustyypit, (koulutustyyppi) => {
      return {
        text: this.$t(koulutustyyppi),
        value: koulutustyyppi,
      };
    });
  }

  get tilaItems(){
    return [
      {text: this.$t('luonnos'), value:'luonnos'},
      {text: this.$t('valmis'), value:'valmis'},
      {text: this.$t('julkaistu'), value:'julkaistu'},
      {text: this.$t('poistettu'), value:'poistettu'},
    ];
  }

  get voimassaoloItems(){
    return [
      {text: this.$t('voimassaolevat'), value:'voimassaoleva'},
      {text: this.$t('tulevat'), value:'tuleva'},
      {text: this.$t('paattyneet'), value:'paattynyt'},
    ];
  }

  get perusteItems() {
    return _.map(this.perusteet, (peruste => {
      return {
        value: peruste.id,
        text: (this as any).$kaanna(peruste.nimi),
      };
    }));
  }

  get tyhjaGraafiOptions() {
    return {
      labels: ['test'],
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      colors: ['#546E7A'],
    };
  }

  get tyhjaGraafiData() {
    return [1];
  }

  async palauta(ops) {
    if (await this.vahvista('palauta-ops', 'palauta-ops-kuvaus', 'palauta')) {
      try {
        await OpetussuunnitelmaStore.updateOpsTila(ops.id!, 'luonnos');
        const idx = _.findIndex(this.opetussuunnitelmat, { id: ops.id });
        if (idx > -1) {
          this.opetussuunnitelmat[idx].tila = 'luonnos' as any;
        }
        success('palautus-onnistui');
      }
      catch (err) {
        fail('palautus-epaonnistui');
      }
    }
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
    }

  }

</style>
