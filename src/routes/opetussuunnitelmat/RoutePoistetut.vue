<template>
  <div class="poistetut">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">
        {{ $t('poistetut') }}
      </h2>
    </div>
    <div class="sisalto">
      <b-tabs
        v-model="tabIndex"
        content-class="mt-4"
      >
        <b-tab
          v-for="(tab, index) in tabs"
          :key="'tab'+index"
          :title="$t(tab.otsikko)"
        >
          <ep-spinner v-if="isLoading" />
          <poistetut-haku-table
            v-else
            :poistetut="tab.poistetut"
            @palauta="palauta"
          />
        </b-tab>
      </b-tabs>

      <div v-if="!isLoading && tabs.length === 0">
        {{ $t('ei-poistettuja-sisaltoja') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Lops2019PoistettuDto, PoistettuTekstiKappaleDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import PoistetutHakuTable from '@shared/components/EpPoistettuTable/PoistetutHakuTable.vue';
import { onMounted } from 'vue';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const store = computed(() => props.opetussuunnitelmaStore);
const isLoading = computed(() => false); // Not needed from the route mixin
const route = useRoute();

const poistetut = ref<Lops2019PoistettuDto[]>([]);
const poistetutTekstikappaleet = ref<PoistettuTekstiKappaleDto[]>([]);
const tabIndex = ref(0);

const tabs = computed(() => {
  return _.filter([{
    otsikko: 'opintojakso',
    poistetut: opintojaksot.value,
  }, {
    otsikko: 'tuodut-opintojaksot',
    poistetut: tuodutOpintojaksot.value,
  }, {
    otsikko: 'oppiaine',
    poistetut: lops2019oppiaineet.value,
  }, {
    otsikko: 'oppiaine',
    poistetut: oppiaineet.value,
  }, {
    otsikko: 'tekstikappaleet',
    poistetut: tekstikappaleet.value,
  }, {
    otsikko: 'tuodut-oppimaarat',
    poistetut: tuodutOppimaarat.value,
  },
  ], tab => _.size(tab.poistetut) > 0);
});

const lops2019oppiaineet = computed(() => {
  return _.filter(poistetut.value, p => p.tyyppi as string === 'lops2019oppiaine');
});

const oppiaineet = computed(() => {
  return _.filter(poistetut.value, p => p.tyyppi as string === 'oppiaine');
});

const tekstikappaleet = computed(() => {
  return poistetutTekstikappaleet.value;
});

const tuodutOpintojaksot = computed(() => {
  return _.filter(poistetut.value, p => p.tyyppi as string === 'tuotu_opintojakso');
});

const opintojaksot = computed(() => {
  return _.filter(poistetut.value, p => p.tyyppi as string === 'opintojakso');
});

const tuodutOppimaarat = computed(() => {
  return _.filter(poistetut.value, p => p.tyyppi as string === 'tuotu_oppimaara');
});

const fetchPoistetut = async () => {
  const res = await Promise.all([
    store.value.getPoistetut(),
    store.value.getPoistetutTekstikappaleet(),
  ]);
  [poistetut.value, poistetutTekstikappaleet.value] = res;
};

const palauta = async (poistettu: any) => {
  await store.value.palauta(poistettu);
  await fetchPoistetut();
};

onMounted(async () => {
  // Ohjataan oikeaan tabiin
  if (route && route.params && route.params.tabIndex) {
    tabIndex.value = _.parseInt(route.params.tabIndex as string);
  }
  await fetchPoistetut();
});

</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.poistetut {

  :deep(.tabs .nav-item a) {
    padding: 10px;
  }

  .ylapaneeli {
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    border-bottom: 1px solid #eee;
    height: 50px;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    padding: 15px;
  }
}

</style>
