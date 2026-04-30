<template>
  <div class="content">
    <h2>{{ $t('muokkaamattomat-osiot') }}</h2>

    <ep-spinner v-if="!opetussuunnitelmanTekstikappale" />
    <div v-else-if="hasMuokkaamattomatTekstikappaleet">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <tbody>
            <tr
              v-for="row in pagedMuokkaamattomat"
              :key="row.osaId"
              class="border-b border-surface-100 odd:bg-surface-50"
            >
              <td class="p-3">
                <router-link
                  :to="{ name: 'tekstikappale', params: { osaId: row.osaId } }"
                >
                  {{ $kaanna(row.nimi) }}
                </router-link>
              </td>
              <td class="p-3 text-right align-middle">
                <EpMaterialIcon>chevron_right</EpMaterialIcon>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EpBPagination
        v-model="currentPage"
        :items-per-page="perPage"
        :total="muokkaamattomatTekstikappaleet.length"
      />
    </div>
    <div
      v-else-if="opetussuunnitelmanTekstikappale && !hasMuokkaamattomatTekstikappaleet"
      class="flex flex-col items-center justify-center mt-4"
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
import EpBPagination from '@shared/components/EpBPagination/EpBPagination.vue';

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

const pagedMuokkaamattomat = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return muokkaamattomatTekstikappaleet.value.slice(start, start + perPage.value);
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
