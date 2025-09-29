<template>
  <ep-home-tile
    icon="groups"
    :route="{ name: 'organisaatio' }"
  >
    <template #header>
      <span>{{ $t('tile-organisaatio') }}</span>
    </template>
    <template #content>
      <ep-spinner v-if="isLoading" />
      <div v-else>
        <b-row class="mx-5 virkailijat">
          <b-col
            v-for="virkailija in virkailijatPrewview"
            :key="virkailija.oid"
            class="virkailija text-left"
            sm="6"
          >
            <span>{{ virkailija.esitysnimi }}</span>
          </b-col>
        </b-row>
        <p
          v-if="virkailijat && virkailijat.length > previewSize"
          class="mt-3 mb-0"
        >
          {{ $t('nayta-lisaa') }}
        </p>
      </div>
    </template>
  </ep-home-tile>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { Kayttajat } from '@/stores/kayttaja';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';

const isLoading = ref(true);
const previewSize = ref(6);

const virkailijat = computed(() => {
  return Kayttajat.virkailijat.value;
});

onMounted(async () => {
  try {
    await Kayttajat.fetchOrganisaatioVirkailijat();
  }
  finally {
    isLoading.value = false;
  }
});

const virkailijatFormatted = computed(() => {
  return _.map(virkailijat.value, virkailija => {
    const esitysnimi = parsiEsitysnimi(virkailija);
    return {
      oid: virkailija.oid,
      esitysnimi,
    };
  });
});

const virkailijatPrewview = computed(() => {
  return _.take(virkailijatFormatted.value, previewSize.value);
});
</script>

<style scoped lang="scss">
.virkailijat {
  .virkailija {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
}
</style>
