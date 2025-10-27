<template>
  <div class="content">
    <h2>{{ $t('muokkaamattomat-osiot') }}</h2>

    <ep-spinner v-if="!opetussuunnitelmanTekstikappale" />
    <div v-else-if="hasMuokkaamattomatTekstikappaleet">
      <b-table
        responsive
        borderless
        striped
        :items="muokkaamattomatTekstikappaleet"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
      >
        <template #cell(nimi)="data">
          <router-link
            :key="data.item.osaId"
            :to="{ name: 'tekstikappale', params: { osaId: data.item.osaId } }"
          >
            {{ $kaanna(data.value) }}
          </router-link>
        </template>

        <template #cell(siirtyminen)>
          <EpMaterialIcon>chevron_right</EpMaterialIcon>
        </template>
      </b-table>

      <EpPagination
        v-model="currentPage"
        :total-rows="muokkaamattomatTekstikappaleet.length"
        :per-page="perPage"
        aria-controls="arkistoidut-opetussuunnitelmat"
        align="center"
      />
    </div>
    <div
      v-else-if="opetussuunnitelmanTekstikappale && !hasMuokkaamattomatTekstikappaleet"
      class="d-flex flex-column align-items-center justify-content-center mt-4"
    >
      <img
        src="@assets/img/images/papukaijamerkki.svg"
        :alt="$t('papukaijamerkki')"
        class="mb-4"
      >
      <p class="text-muted">
        {{ $t('ei-muokkaamattomia-osia') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { TekstiKappaleViitePerusteTekstillaDto, TekstiKappaleKevytDto } from '@shared/api/ylops';
import { $t, $kaanna } from '@shared/utils/globals';
import { unref } from 'vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

const props = defineProps<{
  opetussuunnitelmanTekstikappale: TekstiKappaleViitePerusteTekstillaDto;
}>();

const currentPage = ref(1);
const perPage = ref(5);

const tekstikappaleetRecursive = (tekstikappaleItem: TekstiKappaleViitePerusteTekstillaDto) => {
  let tekstikappaleet: TekstiKappaleViitePerusteTekstillaDto[] = [];

  if (tekstikappaleItem.tekstiKappale) {
    const tekstikappale = {
      ...tekstikappaleItem.tekstiKappale,
      osaId: tekstikappaleItem.id,
    };

    tekstikappaleet = [
      ...tekstikappaleet,
      tekstikappale,
    ];
  }

  if (tekstikappaleItem.lapset) {
    tekstikappaleet = [
      ...tekstikappaleet,
      ..._.chain(tekstikappaleItem.lapset)
        .map((lapsi) => tekstikappaleetRecursive(lapsi))
        .flatten()
        .value(),
    ];
  }

  return tekstikappaleet;
};

const kaikkiOpetussuunnitelmanTekstikappaleet = computed((): TekstiKappaleKevytDto[] => {
  if (unref(props.opetussuunnitelmanTekstikappale)) {
    return tekstikappaleetRecursive(unref(props.opetussuunnitelmanTekstikappale));
  }

  return [];
});

const muokkaamattomatTekstikappaleet = computed(() => {
  return _.filter(kaikkiOpetussuunnitelmanTekstikappaleet.value, (tekstikappale) => _.eq(tekstikappale.luotu, tekstikappale.muokattu));
});

const hasMuokkaamattomatTekstikappaleet = computed(() => {
  return !_.isEmpty(muokkaamattomatTekstikappaleet.value);
});

const fields = computed(() => {
  return [{
    key: 'nimi',
    label: '',
  }, {
    key: 'siirtyminen',
    label: '',
    tdClass: 'text-right',
  }];
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
