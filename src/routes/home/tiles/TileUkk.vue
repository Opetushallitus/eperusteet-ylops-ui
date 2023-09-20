<template>
<ep-home-tile icon="quiz" :route="{ name: 'useinkysytyt' }">
  <template slot="header">
    <span>{{ $t('ukk') }}</span>
  </template>
  <template slot="content">
    <div class="kuvaus">
      <p>{{ $t('ukk-kuvaus') }}</p>
    </div>
  </template>
</ep-home-tile>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';

@Component({
  components: {
    EpHomeTile,
    EpIcon,
  },
})
export default class TileUkk extends Vue {

}
</script>
<style scoped lang="scss">
.kuvaus {
  padding: 1rem;
}
</style>
