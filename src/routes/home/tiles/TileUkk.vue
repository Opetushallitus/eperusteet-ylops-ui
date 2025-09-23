<template>
<ep-home-tile icon="quiz" :route="{ name: 'useinkysytyt' }">
  <template #header>
    <span>{{ $t('ukk') }}</span>
  </template>
  <template #content>
    <div class="kuvaus">
      <p>{{ $t('ukk-kuvaus') }}</p>
    </div>
  </template>
</ep-home-tile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
</script>
<style scoped lang="scss">
.kuvaus {
  padding: 1rem;
}
</style>
