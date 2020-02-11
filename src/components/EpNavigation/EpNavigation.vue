<template>
<div class="topbar" v-sticky="sticky" sticky-z-index="600">
  <b-navbar id="navigation-bar"
            class="ep-navbar"
            type="dark"
            toggleable="md"
            :class="'navbar-style-' + tyyli"
            :style="{ 'background-attachment': sticky ? 'fixed' : '' }">
    <b-navbar-nav>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link id="nav-admin" :to="{ name: 'root' }">
              <fas fixed-width icon="koti" />
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
      <b-nav-form v-if="tutoriaalistore && naytettaviaTutoriaaleja">
        <b-button variant="primary" size="sm" @click="kaynnistaTutoriaali" class="mr-2">
          {{ $t('tutorial-avaa') }}
        </b-button>
      </b-nav-form>

      <!-- Sisällön kieli-->
      <b-nav-item-dropdown id="content-lang-selector" right v-tutorial>
        <template slot="button-content">
          <span class="kielivalitsin">{{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}</span>
        </template>
        <b-dropdown-item @click="valitseSisaltoKieli(kieli)"
                         v-for="kieli in sovelluksenKielet"
                         :key="kieli"
                         :disabled="kieli === sisaltoKieli">
          {{ kieli }}
        </b-dropdown-item>
      </b-nav-item-dropdown>

      <!-- Käyttöliittymän kieli-->
      <b-nav-item-dropdown id="ui-lang-selector" right v-tutorial>
        <template slot="button-content">
          <span class="kielivalitsin">{{ $t("kieli") }}: {{ uiKieli }}</span>
        </template>
        <b-dropdown-item @click="valitseUiKieli(kieli)"
                         v-for="kieli in sovelluksenKielet"
                         :key="kieli"
                         :disabled="kieli === uiKieli">
          {{ kieli }}
        </b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>
  </b-navbar>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Kieli } from '@shared/tyypit';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { Murupolku } from '@/stores/murupolku';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import Sticky from 'vue-sticky-directive';
import _ from 'lodash';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpRoundButton from '@/components/EpButton/EpRoundButton.vue';


@Component({
  directives: {
    oikeustarkastelu,
    Sticky,
  },
  components: {
    EpRoundButton,
    EpButton,
  },
})
export default class EpNavigation extends Vue {
  @Prop({ default: true })
  private sticky!: boolean;

  @Prop({ default: 'normaali' })
  private tyyli!: string;

  @Prop({ required: false })
  private tutoriaalistore!: TutoriaaliStore | undefined;

  get murut() {
    return Murupolku.murut;
  }

  get uiKieli() {
    return Kielet.getUiKieli;
  }

  get sisaltoKieli() {
    return Kielet.getSisaltoKieli;
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
        const computeds = _.get(route, 'instances.default');
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

  private valitseUiKieli(kieli: Kieli) {
    const router = this.$router;
    const current: any = router.currentRoute;
    Kielet.setUiKieli(kieli);
    const next = {
      ...current,
      params: {
        ...current.params,
        lang: kieli || this.$i18n.fallbackLocale,
      },
    };
    router.push(next).catch(_.noop);
  }

  private valitseSisaltoKieli(kieli: Kieli) {
    Kielet.setSisaltoKieli(kieli);
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.topbar {
  .navbar {
    top: 0;
    font-weight: 600;

    .kielivalitsin {
      color: white;
    }

    .breadcrumb {
      margin-bottom: 0;
      background: rgba(0, 0, 0, 0);

      .breadcrumb-item {
        color: white;
        &::before {
          color: white;
        }
        a {
          color: white;
        }
      }
    }
  }

  .ep-navbar {
    height: 50px;
    background-color: $etusivu-header-background;
    background-image: url('../../../public/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: no-repeat;

    .kysymysmerkki {
      color: white;
      cursor: pointer;
    }
  }
}

</style>
