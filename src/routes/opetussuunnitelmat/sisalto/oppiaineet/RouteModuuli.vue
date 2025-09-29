<template>
  <div class="content">
    <ep-spinner v-if="isLoading" />
    <div v-if="!isLoading">
      <h2>{{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})</h2>
      <p
        class="kuvaus"
        v-html="$kaanna(moduuli.kuvaus)"
      />
      <div class="collapse-container">
        <ep-collapse :first="true">
          <template #header>
            <h4>{{ $t('yleiset-tavoitteet') }}</h4>
          </template>
          <ep-prefix-list
            :model-value="moduuli.tavoitteet"
            kohde="kohde"
            arvot="tavoitteet"
          />
        </ep-collapse>
        <ep-collapse>
          <template #header>
            <h4>{{ $t('keskeiset-sisallot') }}</h4>
          </template>
          <ep-prefix-list
            :model-value="moduuli.sisallot"
            kohde="kohde"
            arvot="sisallot"
          />
        </ep-collapse>
        <ep-spinner v-if="!opintojaksot" />
        <ep-collapse v-else-if="opintojaksot.length > 0">
          <template #header>
            <h4>{{ $t('opintojaksot') }}</h4>
          </template>
          <div
            v-for="opintojakso in opintojaksot"
            :key="opintojakso.id"
            class="block-container"
          >
            <div class="oj-content pakollinen">
              <span class="nimi">
                <router-link :to="{ name: 'opintojakso', params: { opintojaksoId: opintojakso.id } }">
                  {{ $kaanna(opintojakso.nimi) }}
                </router-link>
              </span>
              <span class="pituus">{{ opintojakso.laajuus }} {{ $t('opintopiste') }}</span>
            </div>
          </div>
        </ep-collapse>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Lops2019ModuuliDto, Lops2019OpintojaksoDto } from '@shared/api/ylops';
import { PerusteCache } from '@/stores/peruste';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const store = computed(() => props.opetussuunnitelmaStore);

const cache = ref<PerusteCache | null>(null);
const moduuli = ref<Lops2019ModuuliDto | null>(null);
const opintojaksot = ref<Lops2019OpintojaksoDto[]>([]);

const isLoading = computed(() => {
  return !moduuli.value;
});

const init = async () => {
  cache.value = await PerusteCache.of(_.parseInt(route.params.id as string));
  moduuli.value = await cache.value.getModuuli(
    _.parseInt(route.params.oppiaineId as string),
    _.parseInt(route.params.moduuliId as string));
  opintojaksot.value = await store.value.getOpintojaksot({
    moduuliUri: moduuli.value!.koodi!.uri as string,
  } as any);
  // TODO: Implement breadcrumb functionality if needed
  // breadcrumb('moduuli', moduuli.value.nimi);
};

onMounted(async () => {
  await init();
});
</script>

<style lang="scss" scoped>
.content {
  padding: 20px;
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

p.kuvaus {
  margin-top: 40px;
}

.block-container {
  padding-top: 20px;
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
