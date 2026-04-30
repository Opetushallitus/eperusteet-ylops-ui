<template>
  <div
    class="home-container minfull"
    sticky-container
  >
    <EpTestiymparisto />

    <div class="view-container">
      <EpNavbar
        :kayttaja="kayttaja"
        :sovellus-oikeudet="sovellusOikeudet"
        :logout-href="logoutHref"
        :sticky="routeStickyNavi"
        :style="headerStyling"
        :class="headerClass"
      />
      <div
        ref="header"
        class="header"
      >
        <div id="headerExtension" />
      </div>
      <RouterView />
    </div>
    <ep-footer>
      <template #palaute>
        <EpPalauteLinkki yllapito-avain="ops-tyokalu-palaute-url" />
      </template>
    </ep-footer>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue';
import EpFooter from '@shared/components/EpFooter/EpFooter.vue';
import EpTestiymparisto from '@shared/components/EpTestiymparisto/EpTestiymparisto.vue';
import EpPalauteLinkki from '@shared/components/EpPalauteLinkki/EpPalauteLinkki.vue';
import { $t, setConfirmModal } from '@shared/utils/globals';
import { useConfirm } from 'primevue/useconfirm';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import { computed } from 'vue';
import { KayttajaStore } from '@/stores/kayttaja';
import { baseURL } from '@shared/api/ylops';
import { ref } from 'vue';
import { koulutustyyppiBanner } from '@shared/utils/bannerIcons';
import { provide } from 'vue';
import { themes } from '@shared/utils/perusteet';

const route = useRoute();

const props = defineProps<{
  kayttajaStore: KayttajaStore;
}>();

const headerStyling = ref(koulutustyyppiBanner('lukiokoulutus'));
const headerClass = ref('dark');

provide('updateHeaderStyling', (koulutustyyppi: string) => {
  headerStyling.value = koulutustyyppiBanner(koulutustyyppi);
  headerClass.value = koulutustyyppi && themes[koulutustyyppi] !== 'lukiokoulutus' ? 'light' : 'dark';
});

const kayttaja = computed(() => {
  return props.kayttajaStore?.tiedot?.value || null;
});

const sovellusOikeudet = computed(() => {
  return props.kayttajaStore?.sovellusOikeudet.value;
});

const logoutHref = computed(() => {
  return baseURL + '/api/logout';
});

const routeStickyNavi = computed(() => {
  return route.name !== 'root';
});

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

onMounted(() => {
  setConfirmModal(useConfirm());
});
</script>
<style lang="scss" scoped>
@import '@shared/styles/_variables.scss';

.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .header, :deep(.topbar) {
    color: white;
    background-image: url('@assets/img/banners/banner_lukio.svg');
    background-attachment: fixed;
    background-position: 100% 0;
    background-repeat: no-repeat;
    background-size: 100% 200px;
    @media only screen and (min-width: 2503px)  {
    }

    h1 {
      font-weight: 300;
    }
  }
}

.view-container {
  flex:1;
}

</style>
