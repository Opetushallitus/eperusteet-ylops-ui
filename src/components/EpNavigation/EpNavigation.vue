<template>
  <div
    v-sticky="sticky"
    class="topbar"
    sticky-z-index="600"
    :class="headerClass"
  >
    <nav
      id="navigation-bar"
      class="ep-navbar flex flex-wrap items-center min-h-14 px-3 w-full"
      :class="'navbar-style-' + tyyli"
      :style="{ 'background-attachment': sticky ? 'fixed' : '', ...headerStyle }"
    >
      <div class="flex flex-1 flex-wrap items-center min-w-0">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb flex flex-wrap list-none pl-0 mb-0">
            <li class="breadcrumb-item">
              <router-link
                id="nav-admin"
                :to="{ name: 'root' }"
              >
                <EpMaterialIcon>home</EpMaterialIcon>
              </router-link>
            </li>
            <li
              v-for="(routeItem, idx) in routePath"
              :key="idx"
              class="breadcrumb-item"
            >
              <router-link
                v-if="routeItem.muru && routeItem.muru.location"
                :to="routeItem.muru.location"
              >
                {{ $kaanna(routeItem.muru.name) }}
              </router-link>
              <span v-else-if="routeItem.muru">
                {{ $kaanna(routeItem.muru.name) }}
              </span>
              <span v-else>{{ $t('route-' + routeItem.name) }}</span>
            </li>
          </ol>
        </nav>
      </div>
      <div class="flex items-center gap-2 ml-auto shrink-0">
        <EpDropdown
          id="content-lang-selector"
          :right="true"
        >
          <template #button-content>
            <span class="kielivalitsin">{{ $t("kieli-sisalto") }}: {{ $t(sisaltoKieli) }}</span>
          </template>
          <div class="kielet text-right min-w-48">
            <EpDropdownItem
              v-for="kieli in sovelluksenKielet"
              :key="kieli"
              :disabled="kieli === sisaltoKieli"
              @click="valitseSisaltoKieli(kieli)"
            >
              <EpMaterialIcon
                v-if="kieli === sisaltoKieli"
                class="mr-3 valittu"
              >
                check
              </EpMaterialIcon>
              {{ $t(kieli) }}
            </EpDropdownItem>
          </div>
        </EpDropdown>

        <ep-kayttaja
          :tiedot="tiedot"
          :sovellus-oikeudet="sovellusOikeudet"
          :logout-href="logoutHref"
        />
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Kieli } from '@shared/tyypit';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Murupolku } from '@/stores/murupolku';
import { Kayttajat } from '@/stores/kayttaja';
import EpKayttaja from '@shared/components/EpKayttaja/EpKayttaja.vue';
import { koulutustyyppiBanner } from '@shared/utils/bannerIcons';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpDropdown from '@shared/components/EpDropdown/EpDropdown.vue';
import EpDropdownItem from '@shared/components/EpDropdown/EpDropdownItem.vue';
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
  },
);

const route = useRoute();

const tiedot = computed(() => Kayttajat.tiedot.value);

const sovellusOikeudet = computed(() => Kayttajat.sovellusOikeudet.value);

const murut = computed(() => Murupolku.murut.value);

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
      .valittu {
        color: #3467E3;
        vertical-align: -0.25em;
      }
    }

  }

}

</style>
