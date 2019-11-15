<template>
  <base-tile
    icon="valtakunnalliset-perusteet"
    :href="href">
    <template slot="header">
      <span>{{ $t('tile-perusteet') }}</span>
    </template>
    <template slot="content">
      <div class="kuvaus">
        <p>{{ $t('tile-perusteet-kuvaus') }}</p>
      </div>
    </template>
  </base-tile>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    BaseTile,
  },
})
export default class TileOpetussuunnitelmat extends Vue {
  get kieli() {
    return Kielet.getUiKieli;
  }

  get href() {
    return `https://eperusteet.opintopolku.fi/beta/#/${this.kieli}`;
  }
}
</script>

<style scoped lang="scss">
.kuvaus {
  padding: 0 30px 0 30px;
}
</style>
