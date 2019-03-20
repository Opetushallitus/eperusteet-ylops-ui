<template lang="pug">
base-tile(icon="file-signature", color="#5bca13")
  template(slot="header")
    span {{ $t('tile-pohjasi') }}
  template(slot="content")
    ep-spinner(v-if="isLoading")
    div(v-else)
      .alert.alert-light(v-if="pohjat.length === 0")
        span {{ $t('tile-pohjasi-pohjia-ei-loytynyt') }}
      div(v-else)
        p {{ $t('tile-pohjasi-kuvaus') }}
        .pohja(v-for="pohja in nakyvat")
          .name(v-if="pohja.nimi")
            router-link(:to=`{ name: 'opsTiedot', params: { id: pohja.id } }`)
              | {{ $kaanna(pohja.nimi) }}
          .tiedot
            .muokattu {{ $t('muokattu-viimeksi') }} {{ $ago(pohja.muokattu) }}

        button.btn.btn-link(v-if="pohjat.length > Maara" @click="naytaKaikki = !naytaKaikki")
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
import _ from 'lodash';

@Component({
  components: {
    BaseTile,
    EpContent,
    EpSpinner,
  },
})
export default class TilePohjat extends Vue {
  private readonly Maara = 3;
  private naytaKaikki = false;
  private isLoading = true;
  private ladatut: OpetussuunnitelmaInfoDto[] = [];

  public async mounted() {
    await delay(500);
    try {
      const res = await Opetussuunnitelmat.getAll('POHJA');
      this.ladatut = res.data;
    }
    finally {
      this.isLoading = false;
    }
  }

  private get nakyvat() {
    return this.naytaKaikki
      ? this.pohjat
      : _.take(this.pohjat, this.Maara);
  }

  private get pohjat() {
    return _(this.ladatut)
      .sortBy('muokattu')
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
