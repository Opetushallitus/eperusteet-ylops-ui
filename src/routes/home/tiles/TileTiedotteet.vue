<template>
<base-tile icon="muistikirja" :route="{ name: 'tiedotteet' }">
  <template slot="header">
    <span>{{ $t('tiedotteet') }}</span>
  </template>
  <template slot="content">
    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-else>
      <div class="tiedotteet" v-if="tiedotteet && tiedotteet.length > 0">
        <div class="tiedote" v-for="(tiedote, idx) in tiedotteet" :key="idx">
          <small class="mr-4">{{ $cdt(tiedote.luotu, 'L') }}</small>
          <span>{{ $kaanna(tiedote.otsikko) }}</span>
        </div>
      </div>
      <p v-else>{{ $t('tile-tiedotteet-kuvaus') }}</p>
    </div>
  </template>
</base-tile>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component } from 'vue-property-decorator';

import { Tiedotteet } from '@shared/api/eperusteet';
import { julkaisupaikka, onkoUusi } from '@shared/utils/tiedote';
import { Kielet } from '@shared/stores/kieli';

import BaseTile from './BaseTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components: {
    BaseTile,
    EpSpinner,
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
      this.tiedotteet = ((await Tiedotteet.findTiedotteetBy(
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
