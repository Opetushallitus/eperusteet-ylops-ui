<template>
  <EpHomeTile icon="menu_book" :route="{ name: 'oppaat' }">
    <template #header>
      <span>{{ $t('tile-ohjeet-ja-materiaalit') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-ohjeet-ja-materiaalit-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
</script>
