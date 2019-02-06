<template lang="pug">
base-tile
  template(slot="icon")
    fas(icon="file-signature")
  template(slot="header")
    span {{ $t('tile-pohjasi') }}
  template(slot="content")
    p {{ $t('tile-pohjasi-kuvaus') }}
    ep-spinner(v-if="isLoading")
    .pohja(v-for="pohja in pohjat")
      // pre {{ pohja }}
      .name(v-if="pohja.nimi")
        router-link(:to=`{ name: 'pohjanTiedot', \
          params: { id: pohja.id } }`)
          ep-content(:value="pohja.nimi")
      .tiedot
        .muokattu {{ $t('muokattu-viimeksi') }} {{ $ago(pohja.muokattu) }}
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
export default class TilePohjat extends Vue {
  private isLoading = true;
  private ladatut: OpetussuunnitelmaInfoDto[] = [];

  public async mounted() {
    await delay(500);
    this.ladatut = (await Opetussuunnitelmat.getAll('POHJA')).data;
    this.isLoading = false;
  }

  private get pohjat() {
    return _(this.ladatut)
      .map((pohja) => ({
        ...pohja,
        $route: {
        },
      }))
      .value();
  }

}
</script>

<style scoped lang="scss">
.pohja {
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
</style>
