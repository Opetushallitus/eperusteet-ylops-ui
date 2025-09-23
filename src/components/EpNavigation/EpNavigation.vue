<template>
<div class="topbar" v-sticky="sticky" sticky-z-index="600" :class="headerClass">
  <b-navbar id="navigation-bar"
            class="ep-navbar"
            :type="headerClass"
            toggleable="md"
            :class="'navbar-style-' + tyyli"
            :style="{ 'background-attachment': sticky ? 'fixed' : '', ...headerStyle }">
    <b-navbar-nav>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link id="nav-admin" :to="{ name: 'root' }">
              <EpMaterialIcon>home</EpMaterialIcon>
            </router-link>
          </li>
          <li class="breadcrumb-item" v-for="(route, idx) in routePath" :key="idx">
            <router-link v-if="route.muru && route.muru.location" :to="route.muru.location">
              {{ $kaanna(route.muru.name) }}
            </router-link>
            <span v-else-if="route.muru">
              {{ $kaanna(route.muru.name) }}
            </span>
            <span v-else>{{ $t('route-' + route.name) }}</span>
          </li>
        </ol>
      </nav>
    </b-navbar-nav>
    <b-navbar-nav class="ml-auto">

      <!-- Sisällön kieli-->
      <b-nav-item-dropdown id="content-lang-selector" right>
        <template #button-content>
          <span class="kielivalitsin">{{ $t("kieli-sisalto") }}: {{ $t(sisaltoKieli) }}</span>
        </template>
        <div class="kielet">
          <b-dd-item @click="valitseSisaltoKieli(kieli)"
                     v-for="kieli in sovelluksenKielet"
                     :key="kieli"
                     :disabled="kieli === sisaltoKieli">
            <EpMaterialIcon v-if="kieli === sisaltoKieli" class="mr-3 valittu" >check</EpMaterialIcon>
            {{ $t(kieli) }}
          </b-dd-item>
        </div>
      </b-nav-item-dropdown>

      <ep-kayttaja :tiedot="tiedot" :sovellusOikeudet="sovellusOikeudet" :logoutHref="logoutHref"/>

    </b-navbar-nav>
  </b-navbar>
</div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sticky from 'vue-sticky-directive';
import { Kieli } from '@shared/tyypit';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Murupolku } from '@/stores/murupolku';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { Kayttajat } from '@/stores/kayttaja';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpKayttaja from '@shared/components/EpKayttaja/EpKayttaja.vue';
import { koulutustyyppiBanner } from '@shared/utils/bannerIcons';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { baseURL } from '@shared/api/ylops';

const props = withDefaults(
  defineProps<{
    sticky?: boolean;
    tyyli?: string;
    koulutustyyppi?: string;
    headerClass?: string;
  }>(), {
  sticky: false,
  tyyli: 'normaali',
  headerClass: 'dark',
});

const route = useRoute();

const tiedot = computed(() => Kayttajat.tiedot);

const sovellusOikeudet = computed(() => Kayttajat.sovellusOikeudet);

const murut = computed(() => Murupolku.murut);

const sisaltoKieli = computed(() => Kielet.getSisaltoKieli.value);

const sovelluksenKielet = computed(() => UiKielet);

const routePath = computed(() => {
  return _(route.matched)
    .filter('name')
    .map(routeItem => {
      const computeds = _.get(routeItem, 'instances.default') as any;
      const result = {
        ...routeItem,
        muru: murut.value[routeItem!.name!],
        breadname: computeds && computeds.breadcrumb,
      };
      return result;
    })
    .value();
});

const valitseSisaltoKieli = (kieli: Kieli) => {
  Kielet.setSisaltoKieli(kieli);
};

const headerStyle = computed(() => {
  return koulutustyyppiBanner(props.koulutustyyppi!);
});

const logoutHref = computed(() => {
  return baseURL + '/api/logout';
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.topbar {
  color: $color-ops-header-text;

  &.light {
    color: $color-ops-header-black-text;

    :deep(.kayttaja .kayttaja-valikko) {
      color: $color-ops-header-black-text;
    }

    .kielivalitsin {
      color: $color-ops-header-black-text;
    }

  }

  .kielivalitsin {
    color: $color-ops-header-text;
  }

  .navbar {
    top: 0;
    font-weight: 600;

    .breadcrumb {
      margin-bottom: 0;
      background: rgba(0, 0, 0, 0);

      .breadcrumb-item {
        a {
          color: inherit;
        }
      }
    }
  }

  .ep-navbar {
    height: 56px;
    background-color: $etusivu-header-background;
    background-position: 100% 0;
    background-repeat: no-repeat;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }

    .kysymysmerkki {
      cursor: pointer;
    }

    .kielet {
      text-align: right;

      .valittu {
        color: #3467E3;
        vertical-align: -0.25em;
      }
    }

    :deep(.dropdown-menu) {
      padding: 0;
      color: #000000;
      min-width: initial;
    }

    :deep(.dropdown-item) {
      padding: 0.5rem 1rem;
      color: #000000;
    }

    :deep(.dropdown-item:hover) {
      background-color: inherit;
    }

  }

}

</style>
