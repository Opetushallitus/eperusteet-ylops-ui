<template>
  <ep-main-view>
    <template #custom-content>
      <EpOppaat :koulutustyypit="koulutustyypit" />
    </template>
  </ep-main-view>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpOppaat from '@shared/components/EpOppaat/EpOppaat.vue';
import { EperusteetKoulutustyyppiRyhmat } from '@shared/utils/perusteet';

const koulutustyypit = computed(() => {
  return [
    ...EperusteetKoulutustyyppiRyhmat.varhaiskasvatus,
    ...EperusteetKoulutustyyppiRyhmat.esiopetus,
    ...EperusteetKoulutustyyppiRyhmat.perusopetus,
    ...EperusteetKoulutustyyppiRyhmat.lukiokoulutus,
  ];
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>
