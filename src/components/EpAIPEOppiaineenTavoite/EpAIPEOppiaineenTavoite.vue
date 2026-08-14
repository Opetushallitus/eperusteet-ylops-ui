<template>
  <div>
    <h4 class="mt-4">
      {{ $t('tavoitteista-johdetut-oppimisen-tavoitteet') }}
    </h4>
    <div
      v-if="tavoite.tavoitteistaJohdetutOppimisenTavoitteet"
      v-html="$kaanna(tavoite.tavoitteistaJohdetutOppimisenTavoitteet)"
    />
    <div
      v-else
      class="disabled-text"
    >
      {{ $t('ei-sisaltoa') }}
    </div>

    <h4 class="mt-4">
      {{ $t('tavoitealue') }}
    </h4>
    <div v-if="kohdealue">
      {{ $kaanna(kohdealue.nimi) }}
    </div>
    <div
      v-else
      class="disabled-text"
    >
      {{ $t('ei-asetettu') }}
    </div>

    <h4 class="mt-4">
      {{ $t('laaja-alainen-osaaminen') }}
    </h4>
    <EpCollapse
      v-for="(lao, index) in laajaAlaisetOsaamiset"
      :key="'lao' + index"
      class="mb-3"
      :border-bottom="false"
      :use-padding="false"
      chevron-location="left"
      :expanded-by-default="false"
    >
      <template #header>
        <div>{{ $kaanna(lao.nimi) }}</div>
      </template>
      <div
        class="ml-4 pl-1"
        v-html="$kaanna(lao.kuvaus)"
      />
    </EpCollapse>

    <h4 class="mt-4">
      {{ $t('arvioinnin-kohde') }}
    </h4>
    <div
      v-if="tavoite.arvioinninKuvaus"
      v-html="$kaanna(tavoite.arvioinninKuvaus)"
    />
    <div
      v-else
      class="disabled-text"
    >
      {{ $t('ei-sisaltoa') }}
    </div>

    <h4
      v-if="tavoite.arvioinninOtsikko"
      class="mt-4"
    >
      {{ $kaanna(tavoite.arvioinninOtsikko) }}
    </h4>

    <EpArvioinninkohteetTable
      v-if="tavoite.arvioinninkohteet?.length"
      class="mt-4"
      :arvioinninkohteet="tavoite.arvioinninkohteet"
    />

    <h4 class="mt-4">
      {{ $t('vapaa-tekstisisalto') }}
    </h4>
    <div
      v-if="tavoite.vapaaTeksti"
      v-html="$kaanna(tavoite.vapaaTeksti)"
    />
    <div
      v-else
      class="disabled-text"
    >
      {{ $t('ei-sisaltoa') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpArvioinninkohteetTable from '@shared/components/EpArvioinninkohteetTable/EpArvioinninkohteetTable.vue';
import { getSulussaNumero } from '@shared/utils/perusteet';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps<{
  tavoite: any;
}>();

const kohdealue = computed(() => {
  return (props.tavoite.kohdealueet || [])[0] || null;
});

const laajaAlaisetOsaamiset = computed(() => {
  return _.sortBy(props.tavoite.laajaalaisetosaamiset || [], lao => getSulussaNumero(lao.nimi));
});
</script>
