<template>
<div class="sticky-container root" sticky-container="sticky-container">
  <EpTestiymparisto/>

  <router-view class="view-container"/>
  <ep-footer>
    <template #palaute>
      <EpPalauteLinkki yllapito-avain="ops-tyokalu-palaute-url" />
    </template>
  </ep-footer>
</div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import Sticky from 'vue-sticky-directive';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpFooter from '@shared/components/EpFooter/EpFooter.vue';
import EpTestiymparisto from '@shared/components/EpTestiymparisto/EpTestiymparisto.vue';
import EpPalauteLinkki from '@shared/components/EpPalauteLinkki/EpPalauteLinkki.vue';
import { $t } from '@shared/utils/globals';

const route = useRoute();

const getMetaInfo = () => {
  const lang = _.get(route, 'params.lang');
  return {
    title: $t('eperusteet-ops-tyokalu'),
    titleTemplate: null,
    htmlAttrs: {
      lang: lang || 'fi',
    },
    meta: [
      {
        vmid: 'description',
        name: 'description',
        content: $t('tervetuloa-kuvaus'),
      },
      {
        vmid: 'keywords',
        name: 'keywords',
        content: $t('avainsanalista'),
      },
      {
        vmid: 'author',
        name: 'author',
        content: $t('opetushallitus'),
      },
      {
        vmid: 'og:site_name',
        property: 'og:site_name',
        content: $t('eperusteet-ops-tyokalu'),
      },
      {
        vmid: 'og:description',
        property: 'og:description',
        content: $t('tervetuloa-kuvaus'),
      },
      {
        vmid: 'og:locale',
        property: 'og:locale',
        content: (lang || 'fi') + '_FI',
      },
    ],
  };
};

useHead(getMetaInfo);

</script>
<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.view-container {
  flex:1;
}

</style>
