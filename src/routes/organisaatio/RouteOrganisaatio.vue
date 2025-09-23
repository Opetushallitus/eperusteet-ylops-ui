<template>
<ep-main-view>
  <template #header>
    <h1>{{ $t('organisaatio-tyoryhma') }}</h1>
    <p>{{ $t('organisaatio-tyoryhma-kuvaus') }}</p>
    <ep-toggle class="float-right" v-model="showOrganizations">{{ $t('nayta-organisaatiot') }}</ep-toggle>
  </template>

  <ep-spinner v-if="isLoading" />
  <div v-else>
    <b-row class="virkailijat">
      <b-col class="virkailija text-left" sm="6" v-for="virkailija in virkailijatFormatted" :key="virkailija.oid">
        <span class="mr-2">{{ virkailija.esitysnimi }}</span>
        <ul v-if="showOrganizations">
          <li v-for="(org, idx) in virkailija.organisaatiot" :key="idx">
            {{ $kaanna(org.nimi) }}
          </li>
        </ul>
      </b-col>
    </b-row>
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

const { isLoading, loading } = useEpRoute();

const showOrganizations = ref(false);

const init = async () => {
  await Kayttajat.fetchVirkailijatByOrganisaatio();
};

// Call init function in the loading wrapper
loading(init);

const virkailijat = computed(() => {
  return Kayttajat.virkailijat;
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
