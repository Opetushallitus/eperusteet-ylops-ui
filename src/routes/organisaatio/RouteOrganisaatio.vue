<template>
  <ep-main-view>
    <template #header>
      <h1>{{ $t('organisaatio-tyoryhma') }}</h1>
      <p>{{ $t('organisaatio-tyoryhma-kuvaus') }}</p>
      <ep-toggle
        v-model="showOrganizations"
        class="float-right"
      >
        {{ $t('nayta-organisaatiot') }}
      </ep-toggle>
    </template>

    <ep-spinner v-if="isLoading" />
    <div
      v-else-if="virkailijatFormatted"
      class="row virkailijat"
    >
      <div
        v-for="virkailija in virkailijatFormatted"
        :key="virkailija.oid"
        class="virkailija text-left col-sm-6"
      >
        <span class="mr-2">{{ virkailija.esitysnimi }}</span>
        <ul v-if="showOrganizations">
          <li
            v-for="(org, idx) in virkailija.organisaatiot"
            :key="idx"
          >
            {{ $kaanna(org.nimi) }}
          </li>
        </ul>
      </div>
    </div>
  </ep-main-view>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed } from 'vue';
import { Kayttajat } from '@/stores/kayttaja';
import { useEpRoute } from '@/mixins/EpRoute';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import { onMounted } from 'vue';

const showOrganizations = ref(false);
const isLoading = ref(true);

onMounted(async () => {
  await Kayttajat.fetchVirkailijatByOrganisaatio();
  isLoading.value = false;
});

const virkailijat = computed(() => {
  return Kayttajat.virkailijat.value;
});

const virkailijatFormatted = computed(() => {
  return _.map(virkailijat.value, virkailija => {
    return {
      oid: virkailija.oid,
      esitysnimi: parsiEsitysnimi(virkailija),
      organisaatiot: virkailija.organisaatiot,
    };
  });
});
</script>

<style scoped lang="scss">

</style>
