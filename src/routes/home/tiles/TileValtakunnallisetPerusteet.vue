<template>
  <ep-home-tile
    icon="account_balance"
    :href="href"
  >
    <template #header>
      <span>{{ $t('tile-perusteet') }}</span>
    </template>
    <template #content>
      <div class="kuvaus">
        <p>{{ $t('tile-perusteet-kuvaus') }}</p>
      </div>
    </template>
  </ep-home-tile>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Kielet } from '@shared/stores/kieli';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';

const kieli = computed(() => {
  return Kielet.getUiKieli.value;
});

const href = computed(() => {
  return `https://eperusteet.opintopolku.fi/#/${kieli.value}`;
});
</script>

<style scoped lang="scss">
.kuvaus {
  padding: 1rem;
}
</style>
