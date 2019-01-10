<template lang="pug">
div.topbar
  b-navbar(type="dark" toggleable="md" variant="info")
    b-navbar-nav.ml-auto
      b-nav-item-dropdown.btn(id="lang-selector" size="sm" right="")
        template(slot="button-content")
          span {{ $t("kieli") }} ({{ uiKieli }})
        b-dropdown-item(
          @click="valitseKieli(kieli)"
          v-for="kieli in uiKielet"
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

  get uiKielet() { return UiKielet; }

  private valitseKieli(kieli: Kieli) {
    Kielet.setUiKieli(kieli);
  }
}
</script>

<style scoped lang="scss">
</style>
