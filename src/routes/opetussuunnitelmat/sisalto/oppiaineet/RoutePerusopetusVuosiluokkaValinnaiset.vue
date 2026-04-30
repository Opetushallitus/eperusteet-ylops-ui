<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi :store="editointiStore">
      <template #header>
        <h2 class="m-0">
          {{ $t('valinnaisuus-perusopetuksessa') }}
        </h2>
      </template>
      <template #default="{ data }">
        <h3>{{ $kaanna(data.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus.nimi) }}</h3>

        <div
          v-if="data.oppiaineet.length === 0"
          class="mt-4 mb-4 ei-oppiaineita"
        >
          {{ $t('valinnaisia-aineita-ei-ole-luotu') }}
        </div>

        <EpButton
          variant="outline-primary"
          icon="add"
          @click="uusiOppiaine()"
        >
          {{ $t('lisaa-valinnainen-oppiaine') }}
        </EpButton>

        <div
          v-if="data.oppiaineet.length > 0"
          class="overflow-x-auto mt-4"
        >
          <ep-table
            responsive
            striped
            hover
            data-key="id"
            class="w-full border-collapse text-left text-sm"
            :items="data.oppiaineet"
            :fields="valinnaisetTableFields"
            row-class="border-b border-surface-100"
          >
            <template #cell(nimi)="{ item }">
              <router-link :to="{ name:'perusopetuspaikallinenoppiaine', params: { oppiaineId: item.id } }">
                <span>{{ $kaanna(item.nimi) }}</span>
              </router-link>
            </template>
            <template #cell(laajuus)="{ item }">
              <span>{{ item.laajuus }} {{ $t('oppiaine-laajuus-lyhenne') }}</span>
            </template>
            <template #cell(vuosiluokat)="{ item }">
              <div
                v-for="(vuosiluokka, index) in item.vuosiluokat"
                :key="'vuosiluokka'+index"
              >
                <router-link :to="{ name:'perusopetuspaikallinenoppiainevuosiluokka', params: { oppiaineId: item.id, vuosiluokkaId: vuosiluokka.id } }">
                  <span>{{ $t('vuosiluokka') }} {{ $t(vuosiluokka.vuosiluokka) }}</span>
                </router-link>
              </div>
            </template>
          </ep-table>
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusopetusVuosiluokkaValinnaisetStore } from '@/stores/perusopetusvuosiluokkavalinnaisetStore';
import { OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';
import { $t, $kaanna } from '@shared/utils/globals';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Use composables
const route = useRoute();
const router = useRouter();
const ops = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value);

// Reactive data
const editointiStore = ref<EditointiStore | null>(null);
const tabIndex = ref<number>(0);

const init = async () => {
  const vuosiluokkakokonaisuus = _.head(_.filter(ops.value.vuosiluokkakokonaisuudet, vlk =>
    vlk.vuosiluokkakokonaisuus?.id === _.toNumber(route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;
  editointiStore.value = new EditointiStore(new PerusopetusVuosiluokkaValinnaisetStore(ops.value, vuosiluokkakokonaisuus));
};

const valinnaisetTableFields = computed(() => {
  return [
    {
      key: 'nimi',
      label: $t('valinnaisen-nimi'),
      sortable: true,
      thClass: 'p-3 font-semibold border-b border-surface-200',
      tdClass: 'p-3 align-middle',
    },
    {
      key: 'laajuus',
      label: $t('laajuus'),
      sortable: true,
      thClass: 'p-3 font-semibold border-b border-surface-200',
      tdClass: 'p-3 align-middle',
    },
    {
      key: 'vuosiluokat',
      label: $t('vuosiluokat-ja-tavoitteet'),
      sortable: true,
      thClass: 'p-3 font-semibold border-b border-surface-200',
      tdClass: 'p-3 align-middle',
    },
  ];
});

const uusiOppiaine = () => {
  router.push({
    name: 'perusopetuspaikallinenoppiaine',
    params: {
      ...route.params,
      oppiaineId: 'uusi',
    },
  });
};

// Initialize on mount
onMounted(async () => {
  await init();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .ei-oppiaineita {
    font-size: 0.85rem;
    font-style: italic;
    color: $gray-lighten-2;
  }

</style>
