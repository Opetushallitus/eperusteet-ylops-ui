<template>
<div class="content">
  <ep-spinner v-if="isLoading">
  </ep-spinner>
  <div v-if="!isLoading && oppiaine">
    <h2>
      <span>{{ $kaanna(oppiaine.nimi) }}</span>
      <span class="ml-1" v-if="oppiaine.koodi">({{ oppiaine.koodi.arvo }})</span>
    </h2>
    <div class="collapse-container">
      <ep-collapse v-if="oppiaine.tehtava">
        <template #header>
          <h3>{{ isOppiaine ? $t('oppiaineet-tehtava') : $t('oppimaaran-tehtava')}}</h3>
        </template>
        <ep-content
          layout="normal"
          :kasiteHandler="kasiteHandler"
          :kuvaHandler="kuvaHandler"
          v-model="oppiaine.tehtava.kuvaus"> </ep-content>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.laajaAlaisetOsaamiset && !isLuva">
        <template #header>
          <h3>{{ $t('laaja-alainen-osaaminen') }}</h3>
        </template>
        <ep-content
          layout="normal"
          :kasiteHandler="kasiteHandler"
          :kuvaHandler="kuvaHandler"
          v-model="oppiaine.laajaAlaisetOsaamiset.kuvaus"> </ep-content>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.opiskeluymparistoTyotavat && isLuva">
        <template #header>
          <h3>{{ $t('opiskeluymparisto-ja-tyotavat')}}</h3>
        </template>
        <ep-content
          layout="normal"
          :kasiteHandler="kasiteHandler"
          :kuvaHandler="kuvaHandler"
          v-model="oppiaine.opiskeluymparistoTyotavat.kuvaus"> </ep-content>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.tavoitteet">
        <template #header>
          <h3>{{ $t('tavoitteet') }}</h3>
        </template>
        <ep-content
          layout="normal"
          :kasiteHandler="kasiteHandler"
          :kuvaHandler="kuvaHandler"
          v-model="oppiaine.tavoitteet.kuvaus"></ep-content>
        <ep-prefix-list :value="oppiaine.tavoitteet.tavoitealueet" kohde="kohde" arvot="tavoitteet"></ep-prefix-list>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.arviointi">
        <template #header>
          <h3>{{ $t('arviointi') }}</h3>
        </template>
        <ep-content
          layout="normal"
          :kasiteHandler="kasiteHandler"
          :kuvaHandler="kuvaHandler"
          v-model="oppiaine.arviointi.kuvaus"></ep-content>
      </ep-collapse>
      <ep-collapse v-if="perusteJaPaikallisetOppimaarat && perusteJaPaikallisetOppimaarat.length > 0">
        <template #header>
          <h3>{{ $t('oppimaarat') }}</h3>
        </template>
        <div class="oppimaarat-topic">{{ $t('oppiaine-oppimaara-ohje')}}</div>
        <div class="block-container oppimaarat" v-for="oppimaara in perusteJaPaikallisetOppimaarat" :key="oppimaara.id">
          <router-link class="om-content" :to="oppimaara.route">
            <span class="nimi">{{ $kaanna(oppimaara.nimi) }}</span>
          </router-link>
        </div>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.moduulit && oppiaine.moduulit.length > 0">
        <template #header>
          <h3>{{ $t('moduulit') }}</h3>
        </template>
        <div class="oppimaarat-topic">{{ $t('oppiaine-moduuli-ohje')}}</div>
        <div class="block-container">
          <div class="moduulit">
            <div class="moduuli mb-2" v-for="moduuli in moduulit" :key="moduuli.koodiUri">
              <router-link :to="{ name: 'moduuli', params: { moduuliId: moduuli.id } }">
                <ep-opintojakson-moduuli :moduuli="moduuli">
                </ep-opintojakson-moduuli>
              </router-link>
            </div>
          </div>
        </div>
      </ep-collapse>
      <div v-if="!(isOppiaine && isOppimaaria) && isAllowedOppiaine">
        <ep-spinner v-if="!opintojaksot">
        </ep-spinner>
        <ep-collapse else>
          <template #header>
            <h3>{{ $t('opintojaksot') }}</h3>
          </template>
          <div v-if="opintojaksot.length === 0">
            <div class="alert alert-info">{{ $t('opintojaksoja-ei-lisatty') }}</div>
          </div>
          <div v-else>
            <div class="oppimaarat-topic">{{ $t('oppiaine-opintojakso-ohje')}}</div>
            <div class="block-container" v-for="opintojakso in opintojaksot" :key="opintojakso.id">
              <div class="oj-content pakollinen">
                <span class="nimi">
                  <router-link :to="{ name: 'opintojakso', params: { opintojaksoId: opintojakso.id } }">
                    {{ $kaanna(opintojakso.nimi) }}
                  </router-link>
                </span>
                <span class="pituus">{{ opintojakso.laajuus }} {{ $t('opintopiste') }}</span>
              </div>
            </div>
          </div>
          <ep-button icon="add" @click="uusiOpintojakso()">{{ $t('uusi-opintojakso') }}</ep-button>
        </ep-collapse>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpOpintojaksonModuuli from '@shared/components/EpOpintojaksonModuuli/EpOpintojaksonModuuli.vue';
import { Lops2019OppiaineDto } from '@shared/api/ylops';
import { PerusteCache } from '@/stores/peruste';
import { isPaikallisestiSallittuLaajennos } from '@/utils/perusteet';
import { koodiSorters } from '@shared/utils/perusteet';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { useEpRoute } from '@/mixins/EpRoute';
import { useEpOpsComponent } from '@/mixins/EpOpsComponent';
import { $kaanna, $t } from '@shared/utils/globals';
import _ from 'lodash';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Router
const route = useRoute();
const router = useRouter();

// Use composables
const epRoute = useEpRoute();
const {
  store,
  ops,
  opsId,
  isPohja,
  isOps,
  isValmisPohja,
  kasiteHandler,
  kuvaHandler,
  isLuva,
} = useEpOpsComponent(props.opetussuunnitelmaStore);
// Reactive data
const cache = ref<PerusteCache | null>(null);
const oppiaine = ref<Lops2019OppiaineDto | null>(null);

// Computed properties
const isLoading = computed(() => {
  return !oppiaine.value;
});

const perusteJaPaikallisetOppimaarat = computed(() => {
  return [
    ...oppimaarat.value,
    ...paikallisetOppimaarat.value,
  ];
});

const oppimaarat = computed(() => {
  if (oppiaine.value) {
    return _.map(oppiaine.value.oppimaarat, om => ({
      ...om,
      route: { name: 'oppiaine', params: { oppiaineId: om.id } },
    })) || [];
  }
  else {
    return [];
  }
});

const paikallisetOppimaarat = computed(() => {
  return _(store.value.paikallisetOppiaineet)
    .filter(poa => {
      const parentKoodi = poa.perusteenOppiaineUri;
      if (_.get(oppiaine.value, 'koodi.uri') === parentKoodi) {
        return true;
      }
      else {
        // Voi olla myös perusteen oppimäärän alla
        if (oppiaine.value) {
          const parentOm = _.find(oppiaine.value.oppimaarat, { koodi: { uri: parentKoodi } });
          if (parentOm) {
            return true;
          }
        }
      }
      return false;
    })
    .map(poa => ({
      ...poa,
      route: { name: 'paikallinenOppiaine', params: { paikallinenOppiaineId: _.toString(poa.id) } },
    }))
    .value();
});

const opintojaksot = computed(() => {
  return _.chain(store.value.opintojaksot)
    .filter(oj => _(oj.oppiaineet)
      .sortBy('koodi')
      .map('koodi')
      .includes(oppiaine.value!.koodi!.uri))
    .map(opintojakso => {
      const ojOm: any = _.find(opintojakso.oppiaineet, { koodi: oppiaine.value!.koodi!.uri });
      return {
        ...opintojakso,
        jarjestys: ojOm.jarjestys,
      };
    })
    .sortBy('jarjestys', ...koodiSorters())
    .value();
});

const pakollisetModuulit = computed(() => {
  if (!oppiaine.value) {
    return null;
  }
  return _.chain(oppiaine.value.moduulit as any)
    .filter(moduuli => moduuli.pakollinen)
    .sortBy('koodi.arvo')
    .value();
});

const valinnaisetModuulit = computed(() => {
  if (!oppiaine.value) {
    return null;
  }
  return _.chain(oppiaine.value.moduulit)
    .filter(moduuli => !moduuli.pakollinen)
    .sortBy('koodi.arvo')
    .value();
});

const moduulit = computed(() => {
  return [
    ...pakollisetModuulit.value ? pakollisetModuulit.value : [],
    ...valinnaisetModuulit.value ? valinnaisetModuulit.value : [],
  ];
});

const isOppiaine = computed(() => {
  return !(oppiaine.value as any)?._oppiaine;
});

const isOppimaaria = computed(() => {
  return oppiaine.value?.oppimaarat && oppiaine.value.oppimaarat.length > 0;
});

const isAllowedOppiaine = computed(() => {
  return !isPaikallisestiSallittuLaajennos(oppiaine.value?.koodi?.uri as string);
});

// Methods
const uusiOpintojakso = () => {
  router.push({
    name: 'opintojakso',
    params: {
      ...route.params,
      opintojaksoId: 'uusi',
    },
    query: {
      oppiaineet: _.get(oppiaine.value, 'koodi.uri'),
    },
  });
};

const init = async () => {
  cache.value = await PerusteCache.of(_.parseInt(route.params.id as string));
  oppiaine.value = await cache.value.getOppiaine(_.parseInt(route.params.oppiaineId as string));
};

// Lifecycle
onMounted(async () => {
  await init();
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.content {
  padding: 20px;
}

.oppimaarat-topic {
  padding: 10px 0px;
  color: $gray-lighten-1;
}

.oppimaarat {

  &:nth-child(2n) {
    background-color: #F9F9F9;
  }

  .om-content {
    display: flex;
    padding: 10px 20px;
  }

}

.oj-content {
  border-radius: 30px;
  padding: 10px 20px;
  display: flex;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: #e4f3cf;

  &.pakollinen {
    background-color: #eaf5fe;
  }

  span.nimi {
    flex: 1 0 auto;
  }

  span.pituus {
    min-width: 4em;
  }

  span.tyyppi {
    min-width: 6em;
  }
}

.collapse-container {
  padding-top: 30px;
  padding-bottom: 30px;

  div.ep-collapse {
    border-bottom: 1px solid #ccc;
    padding: 30px 10px 30px 0;
  }

  div.ep-collapse:last-child {
    border-bottom: none;
  }
}

</style>
