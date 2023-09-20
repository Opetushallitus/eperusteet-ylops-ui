<template>
<ep-home-tile icon="show_chart" :route="{ name: 'tilastot' }">
  <template slot="header">
    <span>{{ $t('ops-tilastot') }}</span>
  </template>
  <template slot="content">
    <div class="kuvaus">
      <p>{{ $t('tilastot-kuvaus') }}</p>
    </div>
  </template>
</ep-home-tile>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component } from 'vue-property-decorator';

import { Ulkopuoliset } from '@shared/api/ylops';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';

@Component({
  components: {
    EpHomeTile,
  },
})
export default class TileTilastot extends Vue {

}
</script>

<style scoped lang="scss">
.kuvaus {
  padding: 1rem;
}
</style>
