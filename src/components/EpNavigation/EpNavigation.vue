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
        <template slot="button-content">
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

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';
import { Kieli } from '@shared/tyypit';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Murupolku } from '@/stores/murupolku';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import { Kayttajat } from '@/stores/kayttaja';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpKayttaja from '@shared/components/EpKayttaja/EpKayttaja.vue';
import { koulutustyyppiBanner } from '@shared/utils/bannerIcons';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { baseURL } from '@shared/api/ylops';

@Component({
  directives: {
    oikeustarkastelu,
    Sticky,
  },
  components: {
    EpButton,
    EpKayttaja,
    EpMaterialIcon,
  },
})
export default class EpNavigation extends Vue {
  @Prop({ default: false })
  private sticky!: boolean;

  @Prop({ default: 'normaali' })
  private tyyli!: string;

  @Prop({ required: false })
  private tutoriaalistore!: TutoriaaliStore | undefined;

  @Prop({ required: false })
  private koulutustyyppi!: string;

  @Prop({ default: 'dark' })
  private headerClass!: string;

  get tiedot() {
    return Kayttajat.tiedot;
  }

  get sovellusOikeudet() {
    return Kayttajat.sovellusOikeudet;
  }

  get murut() {
    return Murupolku.murut;
  }

  get sisaltoKieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get sovelluksenKielet() {
    return UiKielet;
  }

  get naytettaviaTutoriaaleja() {
    return !_.isEmpty(this.tutoriaalistore!.avaimet);
  }

  get routePath() {
    return _(this.$route.matched)
      .filter('name')
      .map(route => {
        const computeds = _.get(route, 'instances.default') as any;
        const result = {
          ...route,
          muru: this.murut[route!.name!],
          breadname: computeds && computeds.breadcrumb,
        };
        return result;
      })
      .value();
  }

  private kaynnistaTutoriaali() {
    this.tutoriaalistore!.setActive(true);
  }

  private valitseSisaltoKieli(kieli: Kieli) {
    Kielet.setSisaltoKieli(kieli);
  }

  get headerStyle() {
    return koulutustyyppiBanner(this.koulutustyyppi!);
  }

  get logoutHref() {
    return baseURL + '/api/logout';
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.topbar {
  color: $color-ops-header-text;

  &.light {
    color: $color-ops-header-black-text;

    ::v-deep .kayttaja .kayttaja-valikko {
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
    height: 50px;
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

    ::v-deep .dropdown-menu {
      padding: 0;
      color: #000000;
      min-width: initial;
    }

    ::v-deep .dropdown-item {
      padding: 0.5rem 1rem;
      color: #000000;
    }

    ::v-deep .dropdown-item:hover {
      background-color: inherit;
    }

  }

}

</style>
