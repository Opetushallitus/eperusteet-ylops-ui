<template lang="pug">
div
  base-tile(icon="file-signature", color="#5bca13")
    template(slot="header")
      router-link(
        :to="{ name: 'opetussuunnitelmaListaus' }")
        | {{ $t('tile-opetussuunnitelmasi') }}
    template(slot="content")
      ep-spinner(v-if="isLoading")
      div(v-else)
        .alert.alert-light(v-if="ladatut.length === 0")
          span {{ $t('opetussuunnitelmia-ei-loytynyt') }}
        div(v-else)
          p {{ $t('tile-opetussuunnitelmasi-kuvaus') }}
          .ops(v-for="ops in opetussuunnitelmat")
            .d-flex.ops-container
              .stats.p-2.flex-shrink-1
                div
                  ep-chart(:value="ops.valmiusaste",
                    :labelSize="12",
                    :width="60",
                    :height="60")
              .data.p-2
                .name(v-if="ops.nimi")
                  router-link(:to=`{ name: 'opsTiedot', params: { id: ops.id } }`)
                    ep-content(:value="ops.nimi")
                // .tiedot
                  .description
                    span(v-if="ops.kuvaus")
                      ep-content(:value="ops.kuvaus")
                    span(v-else) {{ ops.perusteenDiaarinumero }}
                  .muokattu {{ $t('muokattu-viimeksi') }} {{ $ago(ops.muokattu) }}
          button.btn.btn-link(v-if="opetussuunnitelmat.length > Maara" @click="naytaKaikki = !naytaKaikki")
            | {{ naytaKaikki ? $t('nayta-vahemman') : $t('nayta-lisaa') }}
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';
import EpRoot from '@/mixins/EpRoot';
import BaseTile from './BaseTile.vue';
import EpChart from '@/components/EpChart/EpChart';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import { Opetussuunnitelmat } from '@/api';
import { delay } from '@/utils/delay';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';
import _ from 'lodash';

@Component({
  components: {
    BaseTile,
    EpContent,
    EpSpinner,
    EpChart,
  },
  mixins: [EpRoot],
})
export default class TileOpetussuunnitelmat extends Mixins(EpRoot) {
  private readonly Maara = 3;
  private naytaKaikki = false;
  private ladatut: OpetussuunnitelmaInfoDto[] = [];

  protected async init() {
    await delay(500);
    const res = await Opetussuunnitelmat.getAll();
    this.ladatut = res.data;
  }

  private get nakyvat() {
    return this.naytaKaikki
      ? this.ladatut
      : _.take(this.ladatut, this.Maara);
  }

  private get opetussuunnitelmat() {
    const result = _(this.nakyvat)
      .map((ops) => ({
        ...ops,
        valmiusaste: 50,
      }))
      .value();
    return result;
  }
}
</script>

<style scoped lang="scss">
.ops {
  .ops-container {
    align-items: center;
  }

  .data {
    text-align: left;

    .name {
      font-weight: bold;
    }

    .tiedot {

      .description {
        font-size: 70%;
      }

      .muokattu {
        font-size: 70%;
      }
    }
  }
}
</style>
