<template>
<base-tile icon="tilasto" :route="{ name: 'tilastot' }">
  <template slot="header">
    <span>{{ $t('ops-tilastot') }}</span>
  </template>
  <template slot="content">
    <div class="kuvaus">
      <p>{{ $t('tilastot-kuvaus') }}</p>
    </div>
  </template>
</base-tile>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component } from 'vue-property-decorator';

import { Ulkopuoliset } from '@shared/api/ylops';
import BaseTile from './BaseTile.vue';

@Component({
  components: {
    BaseTile,
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
