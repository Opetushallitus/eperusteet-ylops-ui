<template>
<ep-home-tile icon="muistikirja" :route="{ name: 'tiedotteet' }" :count="uudetTiedotteetCount">
  <template slot="header">
    <span>{{ $t('tiedotteet') }}</span>
  </template>
  <template slot="content">
    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-else>
      <div class="tiedotteet" v-if="tiedotteet && tiedotteet.length > 0">
        <div class="tiedote" v-for="(tiedote, idx) in tiedotteetFormatted" :key="idx">
          <small class="mr-4">{{ $cdt(tiedote.luotu, 'L') }}</small>
          <span :class="{'font-weight-bold': tiedote.uusi}">{{ $kaanna(tiedote.otsikko) }}</span>
        </div>
      </div>
      <p v-else>{{ $t('tile-tiedotteet-kuvaus') }}</p>
    </div>
  </template>
</ep-home-tile>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component } from 'vue-property-decorator';

import { julkaisupaikka, onkoUusi } from '@shared/utils/tiedote';
import { Kielet } from '@shared/stores/kieli';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import { Ulkopuoliset } from '@shared/api/ylops';

@Component({
  components: {
    EpSpinner,
    EpHomeTile,
  },
})
export default class TileTiedotteet extends Vue {
  private isLoading = true;
  private tiedotteet: any[] = [];

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  async mounted() {
    try {
      this.isLoading = true;
      this.tiedotteet = ((await Ulkopuoliset.getTiedotteetHaku(
        0,
        4,
        [_.toUpper(this.kieli)],
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        [julkaisupaikka.ops, julkaisupaikka.lops],
      )).data as any).data;
    }
    catch (err) {
      throw err;
    }
    finally {
      this.isLoading = false;
    }
  }

  get tiedotteetFormatted() {
    return _.map(this.tiedotteet, tiedote => {
      return {
        ...tiedote,
        uusi: onkoUusi(tiedote.luotu),
      };
    });
  }

  get uudetTiedotteetCount() {
    return _.size(_.filter(this.tiedotteetFormatted, 'uusi'));
  }
}
</script>

<style scoped lang="scss">
.tiedotteet {
  padding: 1rem;
  padding-bottom: 0;
  text-align: left;
  display: grid;

  .tiedote {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;

    small {
      color: #071A58;
    }
  }

}

</style>
