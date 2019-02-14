<template lang="pug">
div.topbar
  b-navbar(
    type="dark"
    toggleable="md")

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
import { Component, Vue } from 'vue-property-decorator';
import { Kieli } from '@/tyypit';
import { Kielet, UiKielet } from '@/stores/kieli';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import Loading from 'vue-loading-overlay';

@Component({
  directives: {
    oikeustarkastelu,
  },
})
export default class Root extends Vue {
  get uiKieli() { return Kielet.getUiKieli(); }
  get sisaltoKieli() { return Kielet.getSisaltoKieli(); }
  get sovelluksenKielet() { return UiKielet; }

  private valitseUiKieli(kieli: Kieli) {
    const router = this.$router;
    const current = router.currentRoute;
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
@import '../../styles/variables';

.topbar {
  .navbar {
    top: 0;
    background: $color-ops-header;
    font-weight: 600;

    .kielivalitsin {
      color: white;
    }
  }
}

</style>
