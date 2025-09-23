<template>
  <div class="content">
    <h2>{{$t('oppiaineet')}}</h2>

    <ep-spinner v-if="!cache"></ep-spinner>
    <div v-else>

      <div class="box d-inline-flex align-items-center flex-column" v-if="isLops2019">
        <div class="count">{{luodutOpintojaksot}}</div>
        <div class="topic text-center">{{ $t('luotuja-opintojaksoja') }}</div>
      </div>

      <div class="box d-inline-flex align-items-center flex-column" v-if="isLops2019">
        <div class="count">
          <span>{{liitetytModuulitLukumaara}}</span>
          <span class="secondary">/ {{moduulitLukumaara}}</span>
        </div>
        <div class="topic text-center">{{ $t('moduulia-liitetty') }}</div>
      </div>

      <div class="box d-inline-flex align-items-center flex-column" v-if="isLops2019">
        <div class="count">{{useanOppiaineenOpintojaksot}}</div>
        <div class="topic text-center">{{$t('usean-oppiaineen-opintojaksoa')}}</div>
      </div>

      <div class="box d-inline-flex align-items-center flex-column" v-if="!isLops2019">
        <div class="count">{{oppimaarat}}</div>
        <div class="topic text-center">{{$t('luotua-oppimaaraa')}}</div>
      </div>

      <div class="box d-inline-flex align-items-center flex-column" >
        <div class="count" v-if="isLops2019">{{paikallisetOppiaineet}}</div>
        <div class="count" v-if="!isLops2019">{{valinnaisetOppiaineet}}</div>
        <div class="topic text-center">{{$t('paikallista-oppiainetta')}}</div>
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
import { useEpOpsComponent } from '@/mixins/EpOpsComponent';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { PerusteCache } from '@/stores/peruste';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const { store, isLops2019 } = useEpOpsComponent(props.opetussuunnitelmaStore);

const cache = ref<PerusteCache | null>(null);

const perusteCache = computed(() => {
  return cache.value;
});

const luodutOpintojaksot = computed(() => {
  return _.size(store.value.opintojaksot);
});

const opintojaksojenModuuliKoodiUri = computed(() => {
  return _.chain(store.value.opintojaksot)
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
      ...store.value.paikallisetOppiaineet,
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
  return _.size(_.filter(store.value.opintojaksot, (opintojakso) => _.size(opintojakso.oppiaineet) > 1));
});

const paikallisetOppiaineet = computed(() => {
  return _.size(store.value.paikallisetOppiaineet);
});

const valinnaisetOppiaineet = computed(() => {
  return _.size(store.value.valinnaisetOppiaineet);
});

const oppimaarat = computed(() => {
  return _.sum(_.map(store.value.opetussuunnitelma?.oppiaineet || [], oppiaine => _.size(oppiaine.oppiaine!.oppimaarat)));
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
