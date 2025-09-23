<template>
  <div>
    <ep-navigation />
    <ep-tiedote-view :tiedotteet="tiedotteet">
      <template #search>
        <ep-search class="mb-3" v-model="rajain" @input="updateSearch" />
      </template>
      <template #pagination>
        <b-pagination
          class="justify-content-center"
          v-model="sivu"
          :per-page="sivukoko"
          :total-rows="kokonaismaara"
          :limit="10"
          @input="update"
          aria-controls="tiedotteet" />
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
import { useEpRoot } from '@/mixins/EpRoot';
import { Ulkopuoliset } from '@shared/api/ylops';
import { debounced } from '@shared/utils/delay';

const { loading } = useEpRoot();

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

const init = async () => {
  await update();
};

// Call init function in the loading wrapper
loading(init);

// Watch for pagination changes
watch(sivu, () => {
  update();
});

// Watch for search changes
watch(rajain, () => {
  updateSearch();
});
</script>
