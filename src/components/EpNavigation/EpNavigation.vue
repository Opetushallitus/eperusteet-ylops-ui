<template lang="pug">
div.topbar(v-sticky="sticky")

  b-navbar.ep-navbar(
    type="dark",
    toggleable="md",
    :class="'navbar-style-' + tyyli")

    b-navbar-nav
      nav(aria-label="breadcrumb")
        ol.breadcrumb
          li.breadcrumb-item
            router-link(id="nav-admin" :to="{ name: 'root' }")
              fas.fa-fw(icon="home")
          li.breadcrumb-item(v-for="route in routePath")
            span(v-if="murut[route.name]") {{ $kaanna(murut[route.name]) }}
            span(v-else) {{ $t('route-' + route.name) }}

    b-navbar-nav.ml-auto
      // Sisällön kieli
      b-nav-item-dropdown(id="content-lang-selector")
        template(slot="button-content")
          span.kielivalitsin {{ $t("kieli-sisalto") }}: {{ sisaltoKieli }}
        b-dropdown-item(
          @click="valitseSisaltoKieli(kieli)"
          v-for="kieli in sovelluksenKielet"
          :key="kieli"
          :disabled="kieli === sisaltoKieli") {{ kieli }}

      // Käyttöliittymän kieli
      b-nav-item-dropdown(id="ui-lang-selector")
        template(slot="button-content")
          span.kielivalitsin {{ $t("kieli") }}: {{ uiKieli }}
        b-dropdown-item(
          @click="valitseUiKieli(kieli)"
          v-for="kieli in sovelluksenKielet"
          :key="kieli"
          :disabled="kieli === uiKieli") {{ kieli }}

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Kieli } from '@/tyypit';
import { Kielet, UiKielet } from '@/stores/kieli';
import { Murupolku } from '@/stores/murupolku';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import Loading from 'vue-loading-overlay';
import Sticky from 'vue-sticky-directive';
import _ from 'lodash';

@Component({
  directives: {
    oikeustarkastelu,
    Sticky,
  },
})
export default class EpNavigation extends Vue {
  @Prop({ default: true })
  private sticky!: boolean;

  @Prop({ default: 'normaali' })
  private tyyli!: string;

  get murut() {
    return Murupolku.murut();
  }

  get uiKieli() {
    return Kielet.getUiKieli();
  }

  get sisaltoKieli() {
    return Kielet.getSisaltoKieli();
  }

  get sovelluksenKielet() {
    return UiKielet;
  }

  get routePath() {
    return _(this.$route.matched)
      .filter('name')
      .map(route => {
        const computeds = _.get(route, 'instances.default');
        const result = {
          ...route,
          breadname: computeds && computeds.breadcrumb,
        };
        return result;
      })
      .value();
  }

  private valitseUiKieli(kieli: Kieli) {
    const router = this.$router;
    const current: any = router.currentRoute;
    router.push({
      ...current,
      params: {
        ...current.params,
        lang: kieli || this.$i18n.fallbackLocale,
      },
    });
    Kielet.setUiKieli(kieli);
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
      background: rgba(0, 0, 0, 0);

      .breadcrumb-item {
        color: rgba(255, 255, 255, 255);
        cursor: pointer;

        a {
          color: rgba(255, 255, 255, 255);
        }
      }
    }
  }

  .ep-navbar {
    background-attachment: fixed;
    background-color: $etusivu-header-background;
    background-image: url('../../../public/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: no-repeat;
  }

}

</style>
