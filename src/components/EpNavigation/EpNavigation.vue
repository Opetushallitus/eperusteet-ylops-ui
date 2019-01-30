<template lang="pug">
div.topbar
  b-navbar(
    type="dark"
    variant="dark"
    toggleable="md"
    :sticky="true")

    b-navbar-nav
      b-nav-item(id="nav-admin" :to="{ name: 'root' }")
        fas.fa-fw(icon="home")

    b-navbar-nav.ml-auto
      // Sisällön kieli
      b-nav-item-dropdown(id="content-lang-selector")
        template(slot="button-content")
          span {{ $t("kieli-sisalto") }} ({{ sisaltoKieli }})
        b-dropdown-item(
          @click="valitseSisaltoKieli(kieli)"
          v-for="kieli in sovelluksenKielet"
          :key="kieli"
          :disabled="kieli === sisaltoKieli") {{ kieli }}

      // Käyttöliittymän kieli
      b-nav-item-dropdown(id="ui-lang-selector")
        template(slot="button-content")
          span {{ $t("kieli") }} ({{ uiKieli }})
        b-dropdown-item(
          @click="valitseUiKieli(kieli)"
          v-for="kieli in sovelluksenKielet"
          :key="kieli"
          :disabled="kieli === uiKieli") {{ kieli }}

      // Admin
      b-nav-item(id="nav-admin" :to="{ name: 'admin' }" v-oikeustarkastelu="'hallinta'")
        fas.fa-fw(icon="cog")
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kieli } from '@/tyypit';
import { Kielet, UiKielet } from '@/stores/kieli';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';

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
</style>
