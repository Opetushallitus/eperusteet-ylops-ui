<template lang="pug">
div.topbar(v-sticky="sticky")
  b-navbar(
    type="dark",
    toggleable="md",
    :class="'navbar-style-' + tyyli")

    b-navbar-nav
      b-nav-item(id="nav-admin" :to="{ name: 'root' }")
        fas.fa-fw(icon="home")

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
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import Loading from 'vue-loading-overlay';
import Sticky from 'vue-sticky-directive';

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

  get uiKieli() {
    return Kielet.getUiKieli();
  }
  get sisaltoKieli() {
    return Kielet.getSisaltoKieli();
  }
  get sovelluksenKielet() {
    return UiKielet;
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
    background-color: inherit;
    top: 0;
    font-weight: 600;

    .kielivalitsin {
      color: white;
    }
  }

  .navbar-style-normaali {
    /* background-color: $etusivu-header-background; */
    /* background-image: url('/img/banners/etusivu_tausta.svg'); */
    /* background-position: 100% 0; */
    /* background-repeat: no-repeat; */
  }

  .navbar-style-ops {
    background-color: $color-ops-header;
  }

}

</style>
