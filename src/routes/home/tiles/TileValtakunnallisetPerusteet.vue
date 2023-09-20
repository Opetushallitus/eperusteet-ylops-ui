<template>
  <ep-home-tile
    icon="account_balance"
    :href="href">
    <template slot="header">
      <span>{{ $t('tile-perusteet') }}</span>
    </template>
    <template slot="content">
      <div class="kuvaus">
        <p>{{ $t('tile-perusteet-kuvaus') }}</p>
      </div>
    </template>
  </ep-home-tile>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';

@Component({
  components: {
    EpHomeTile,
  },
})
export default class TileOpetussuunnitelmat extends Vue {
  get kieli() {
    return Kielet.getUiKieli.value;
  }

  get href() {
    return `https://eperusteet.opintopolku.fi/beta/#/${this.kieli}`;
  }
}
</script>

<style scoped lang="scss">
.kuvaus {
  padding: 1rem;
}
</style>
