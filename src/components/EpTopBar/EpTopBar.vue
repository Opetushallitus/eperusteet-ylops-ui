<template lang="pug">
div.topbar
  b-navbar(type="dark" toggleable="md" variant="info")
    b-navbar-nav.ml-auto
      // Sisällön kieli
      b-nav-item-dropdown.btn(id="lang-selector" size="sm" right="")
        template(slot="button-content")
          span {{ $t("kieli-sisalto") }} ({{ sisaltoKieli }})
        b-dropdown-item(
          @click="valitseSisaltoKieli(kieli)"
          v-for="kieli in sovelluksenKielet"
          :disabled="kieli === sisaltoKieli")
          span {{ kieli }}

      // Käyttöliittymän kieli
      b-nav-item-dropdown.btn(id="lang-selector" size="sm" right="")
        template(slot="button-content")
          span {{ $t("kieli") }} ({{ uiKieli }})
        b-dropdown-item(
          @click="valitseUiKieli(kieli)"
          v-for="kieli in sovelluksenKielet"
          :disabled="kieli === uiKieli")
          span {{ kieli }}
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kieli } from '@/tyypit';
import { Kielet, UiKielet } from '@/stores/kieli';

@Component
export default class Root extends Vue {
  get uiKieli() { return Kielet.getUiKieli(); }
  get sisaltoKieli() { return Kielet.getSisaltoKieli(); }
  get sovelluksenKielet() { return UiKielet; }

  private valitseUiKieli(kieli: Kieli) {
    Kielet.setUiKieli(kieli);
  }

  private valitseSisaltoKieli(kieli: Kieli) {
    Kielet.setSisaltoKieli(kieli);
  }

}
</script>

<style scoped lang="scss">
</style>
