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

<script lang="ts">
import _ from 'lodash';
import { Component, Vue, Prop } from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpFooter from '@shared/components/EpFooter/EpFooter.vue';
import { Meta } from '@shared/utils/decorators';
import EpTestiymparisto from '@shared/components/EpTestiymparisto/EpTestiymparisto.vue';
import EpPalauteLinkki from '@shared/components/EpPalauteLinkki/EpPalauteLinkki.vue';

@Component({
  directives: {
    Sticky,
  },
  components: {
    EpNavigation,
    EpFooter,
    EpTestiymparisto,
    EpPalauteLinkki,
  },
})
export default class Root extends Vue {
  @Meta
  getMetaInfo() {
    const lang = _.get(this.$route, 'params.lang');
    return {
      title: this.$t('eperusteet-ops-tyokalu'),
      titleTemplate: null,
      htmlAttrs: {
        lang: lang || 'fi',
      },
      meta: [
        {
          vmid: 'description',
          name: 'description',
          content: this.$t('tervetuloa-kuvaus'),
        },
        {
          vmid: 'keywords',
          name: 'keywords',
          content: this.$t('avainsanalista'),
        },
        {
          vmid: 'author',
          name: 'author',
          content: this.$t('opetushallitus'),
        },
        {
          vmid: 'og:site_name',
          property: 'og:site_name',
          content: this.$t('eperusteet-ops-tyokalu'),
        },
        {
          vmid: 'og:description',
          property: 'og:description',
          content: this.$t('tervetuloa-kuvaus'),
        },
        {
          vmid: 'og:locale',
          property: 'og:locale',
          content: lang + '_FI',
        },
      ],
    };
  }
}

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
