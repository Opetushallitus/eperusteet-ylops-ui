<template>
  <div>
    <ep-navigation />
    <ep-tiedote-view :tiedotteet="tiedotteet">
      <template #search>
        <ep-search
          v-model="rajain"
          class="mb-3"
          @input="updateSearch"
        />
      </template>
      <template #pagination>
        <EpPagination
          v-model="sivu"
          class="justify-content-center"
          :per-page="sivukoko"
          :total-rows="kokonaismaara"
          :limit="10"
          aria-controls="tiedotteet"
          @update:model-value="update"
        />
      </template>
    </ep-tiedote-view>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { julkaisupaikka } from '@shared/utils/tiedote';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpTiedoteView from '@shared/components/EpTiedoteView/EpTiedoteView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import { Ulkopuoliset } from '@shared/api/ylops';
import { debounced } from '@shared/utils/delay';
import { onMounted } from 'vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

const rajain = ref('');
const tiedotteet = ref<any[] | null>(null);
const sivu = ref(1);
const sivukoko = ref(10);
const kokonaismaara = ref(0);

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const update = async () => {
  tiedotteet.value = null;
  const tiedotteetHaku = ((await Ulkopuoliset.getTiedotteetHaku(
    sivu.value - 1,
    sivukoko.value,
    [_.toUpper(kieli.value)],
    rajain.value,
    undefined,
    undefined,
    undefined,
    undefined,
    [julkaisupaikka.ops, julkaisupaikka.lops],
  )).data as any);
  tiedotteet.value = tiedotteetHaku.data;
  kokonaismaara.value = tiedotteetHaku.kokonaismäärä;
};

const updateSearch = debounced(async () => {
  sivu.value = 1;
  await update();
}, 300);

// Watch for pagination changes
watch(sivu, () => {
  update();
});

// Watch for search changes
watch(rajain, () => {
  updateSearch();
});

onMounted(async () => {
  await update();
});
</script>
