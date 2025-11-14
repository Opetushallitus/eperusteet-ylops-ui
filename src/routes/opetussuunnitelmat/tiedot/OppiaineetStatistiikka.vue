<template>
  <div class="content">
    <h2>{{ $t('oppiaineet') }}</h2>

    <ep-spinner v-if="!cache" />
    <div v-else>
      <div
        v-if="isLops2019"
        class="box d-inline-flex align-items-center flex-column"
      >
        <div class="count">
          {{ luodutOpintojaksot }}
        </div>
        <div class="topic text-center">
          {{ $t('luotuja-opintojaksoja') }}
        </div>
      </div>

      <div
        v-if="isLops2019"
        class="box d-inline-flex align-items-center flex-column"
      >
        <div class="count">
          <span>{{ liitetytModuulitLukumaara }}</span>
          <span class="secondary">/ {{ moduulitLukumaara }}</span>
        </div>
        <div class="topic text-center">
          {{ $t('moduulia-liitetty') }}
        </div>
      </div>

      <div
        v-if="isLops2019"
        class="box d-inline-flex align-items-center flex-column"
      >
        <div class="count">
          {{ useanOppiaineenOpintojaksot }}
        </div>
        <div class="topic text-center">
          {{ $t('usean-oppiaineen-opintojaksoa') }}
        </div>
      </div>

      <div
        v-if="!isLops2019"
        class="box d-inline-flex align-items-center flex-column"
      >
        <div class="count">
          {{ oppimaarat }}
        </div>
        <div class="topic text-center">
          {{ $t('luotua-oppimaaraa') }}
        </div>
      </div>

      <div class="box d-inline-flex align-items-center flex-column">
        <div
          v-if="isLops2019"
          class="count"
        >
          {{ paikallisetOppiaineet }}
        </div>
        <div
          v-if="!isLops2019"
          class="count"
        >
          {{ valinnaisetOppiaineet }}
        </div>
        <div class="topic text-center">
          {{ $t('paikallista-oppiainetta') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { OpetussuunnitelmaKevytDto, Lops2019OppiaineDto } from '@shared/api/ylops';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { PerusteCache } from '@/stores/peruste';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const store = computed(() => props.opetussuunnitelmaStore);
const isLops2019 = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.toteutus as string === 'lops2019');

const cache = ref<PerusteCache | null>(null);

const perusteCache = computed(() => {
  return cache.value;
});

const luodutOpintojaksot = computed(() => {
  return _.size(store.value.opintojaksot.value);
});

const opintojaksojenModuuliKoodiUri = computed(() => {
  return _.chain(store.value.opintojaksot.value)
    .map((oa) => _.map(oa.moduulit, (moduuli) => moduuli.koodiUri))
    .flatten()
    .value();
});

const perusteenOppiaineidenOppimaarat = computed(() => {
  if (cache.value) {
    return _.chain(cache.value.peruste.oppiaineet)
      .map((oa) => _.map(oa.oppimaarat, (oppimaarat) => ({
        ...oppimaarat,
      })))
      .flatten()
      .value();
  }
  else {
    return [];
  }
});

const oppiaineet = computed(() => {
  if (cache.value) {
    return [
      ...cache.value.peruste.oppiaineet,
      ...store.value.paikallisetOppiaineet.value,
      ...perusteenOppiaineidenOppimaarat.value,
    ] as Lops2019OppiaineDto[];
  }
  return undefined;
});

const moduulit = computed(() => {
  return _.chain(oppiaineet.value)
    .map((oa) => _.map(oa.moduulit, (moduuli) => ({
      ...moduuli,
    })))
    .flatten()
    .value();
});

const liitetytModuulitLukumaara = computed(() => {
  return _.size(
    _.filter(moduulit.value, (moduuli) => _.includes(opintojaksojenModuuliKoodiUri.value, moduuli.koodi!.uri)),
  );
});

const moduulitLukumaara = computed(() => {
  return _.size(moduulit.value);
});

const useanOppiaineenOpintojaksot = computed(() => {
  return _.size(_.filter(store.value.opintojaksot.value, (opintojakso) => _.size(opintojakso.oppiaineet) > 1));
});

const paikallisetOppiaineet = computed(() => {
  return _.size(store.value.paikallisetOppiaineet.value);
});

const valinnaisetOppiaineet = computed(() => {
  return _.size(store.value.valinnaisetOppiaineet.value);
});

const oppimaarat = computed(() => {
  return _.sum(_.map(store.value.opetussuunnitelma?.value?.oppiaineet || [], oppiaine => _.size(oppiaine.oppiaine!.oppimaarat)));
});

onMounted(async () => {
  cache.value = await PerusteCache.of(_.parseInt(route.params.id as string));
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .box {
    width: 125px;
    height: 140px;
    margin-right: 10px;
    margin-top: 10px;
    padding: 10px;
    background-color: #f7f8fc;

    .count {
      font-size: 2.375rem;
      line-height: 1;

      .secondary {
        font-size: 1rem;
        color: $gray-lighten-1;
      }
    }

    .topic {
      padding-top: 10px;
    }
  }

</style>
