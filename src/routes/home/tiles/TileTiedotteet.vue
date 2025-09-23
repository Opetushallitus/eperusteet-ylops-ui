<template>
<ep-home-tile icon="description" :route="{ name: 'tiedotteet' }" :count="uudetTiedotteetCount">
  <template #header>
    <span>{{ $t('tiedotteet') }}</span>
  </template>
  <template #content>
    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-else>
      <div class="tiedotteet" v-if="tiedotteet && tiedotteet.length > 0">
        <div class="tiedote" v-for="(tiedote, idx) in tiedotteetFormatted" :key="idx">
          <small class="mr-4">{{ $cdt(tiedote.luotu, 'L') }}</small>
          <span :class="{'font-weight-bold': tiedote.uusi}">{{ $kaanna(tiedote.otsikko) }}</span>
        </div>
      </div>
      <p v-else>{{ $t('tile-tiedotteet-kuvaus') }}</p>
    </div>
  </template>
</ep-home-tile>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { julkaisupaikka, onkoUusi } from '@shared/utils/tiedote';
import { Kielet } from '@shared/stores/kieli';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import { Ulkopuoliset } from '@shared/api/ylops';

const isLoading = ref(true);
const tiedotteet = ref<any[]>([]);

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

onMounted(async () => {
  try {
    isLoading.value = true;
    tiedotteet.value = ((await Ulkopuoliset.getTiedotteetHaku(
      0,
      4,
      [_.toUpper(kieli.value)],
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
    isLoading.value = false;
  }
});

const tiedotteetFormatted = computed(() => {
  return _.map(tiedotteet.value, tiedote => {
    return {
      ...tiedote,
      uusi: onkoUusi(tiedote.luotu),
    };
  });
});

const uudetTiedotteetCount = computed(() => {
  return _.size(_.filter(tiedotteetFormatted.value, 'uusi'));
});
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
