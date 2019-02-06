<template lang="pug">
base-tile
  template(slot="icon")
    fas(icon="file-signature")
  template(slot="header")
    span {{ $t('tile-opetussuunnitelmasi') }}
  template(slot="content")
    p {{ $t('tile-opetussuunnitelmasi-kuvaus') }}
    ep-spinner(v-if="isLoading")
    .ops(v-for="ops in opetussuunnitelmat")
      // pre {{ ops }}
      .d-flex
        .stats.p-2.flex-shrink-1
          div(style="height: 80px; width: 80px; top: -24px;")
            apexchart(
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
    button.btn.btn-link {{ $t('nayta-lisaa') }}
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
  private isLoading = true;
  private ladatut: OpetussuunnitelmaInfoDto[] = [];

  public async mounted() {
    await delay(500);
    this.ladatut = (await Opetussuunnitelmat.getAll()).data;
    this.isLoading = false;
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
