<template lang="pug">
base-tile
  template(slot="icon")
    fas(icon="file-signature")
  template(slot="header")
    span {{ $t('tile-opetussuunnitelmasi') }}
  template(slot="content")
    ep-spinner(v-if="isLoading")
    div(v-else)
      .alert.alert-light(v-if="ladatut.length === 0")
        span {{ $t('tile-opetussuunnitelmia-ei-loytynyt') }}
      div(v-else)
        p {{ $t('tile-opetussuunnitelmasi-kuvaus') }}
        .ops(v-for="ops in nakyvat")
          // pre {{ ops }}
          .d-flex
            .stats.p-2.flex-shrink-1
              div(style="height: 80px; width: 80px; top: -24px;")
                // apexchart(
                  type="radialBar",
                  :height="ops.$$tila.height",
                  :options="ops.$$tila.options",
                  :series="ops.$$tila.series")
            .data.p-2
              .name(v-if="ops.nimi")
                ep-content(:value="ops.nimi")
              .tiedot
                .description
                  span(v-if="ops.kuvaus")
                    ep-content(:value="ops.kuvaus")
                  span(v-else) {{ ops.perusteenDiaarinumero }}
                .muokattu {{ $t('muokattu-viimeksi') }} {{ $ago(ops.muokattu) }}
        button.btn.btn-link(v-if="opetussuunnitelmat.length > Maara" @click="naytaKaikki = !naytaKaikki")
          | {{ naytaKaikki ? $t('nayta-vahemman') : $t('nayta-lisaa') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import { Opetussuunnitelmat } from '@/api';
import { delay } from '@/utils/delay';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';
import { roundChart } from '@/utils/graphs';
import _ from 'lodash';
import VueApexCharts from 'vue-apexcharts';


@Component({
  components: {
    BaseTile,
    EpContent,
    EpSpinner,
    apexchart: VueApexCharts,
  }
})
export default class TileOpetussuunnitelmat extends Vue {
  private readonly Maara = 3;
  private naytaKaikki = false;
  private isLoading = true;
  private ladatut: OpetussuunnitelmaInfoDto[] = [];

  public async mounted() {
    await delay(500);
    try {
      const res = await Opetussuunnitelmat.getAll();
      this.ladatut = res.data;
    }
    finally {
      this.isLoading = false;
    }
  }

  private get nakyvat() {
    return this.naytaKaikki
      ? this.ladatut
      : _.take(this.ladatut, this.Maara);
  }

  private get opetussuunnitelmat() {
    return _(this.ladatut)
      .map(ops => ({
        ...ops,
        $$tila: roundChart(''),
      }))
      .value();
  }

}
</script>

<style scoped lang="scss">
.ops {
  .data {
    .name {
      font-weight: bold;
    }
    .tiedot {
      margin-left: 10px;
      .description {
        font-size: 80%;
      }

      .muokattu {
        font-size: 70%;
      }
    }
  }
  .stats {
  }
}
</style>
