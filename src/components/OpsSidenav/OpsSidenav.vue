<template lang="pug">
.sidebar
  .search
    .inlay
      input.form-control.megasearch(type="text" placeholder="Etsi")
      fas.inner-icon(icon="search")

  ul.navigation(v-if="opsLapset.length>0")
    ep-recursive-nav(:value="valikkoData")
      template(v-slot:previousLink="{ itemData, itemRoute, navigate }")
        ops-sidenav-link.previous-link(:to="itemRoute", :click="navigate")
          fas(icon="chevron-left")
          a.btn.btn-link {{ kaanna(itemData.item) }}
      template(v-slot="{ itemData, isPreviousLink, isSubmenu, navigate, itemRoute }")
        ops-sidenav-link(:to="itemRoute",
          :class="{ 'module-link': itemData.item.type=='moduuli' }",
          v-if="!isSubmenu && itemRoute")
          ep-color-ball(
            v-if="naytaTilakoodi(itemData.item)",
            :kind="itemData.item.objref.pakollinen ? 'pakollinen': 'normaali'"
            )
          a.btn.btn-link
            span {{ kaanna(itemData.item) }}
            span.code-field(v-if="naytaTilakoodi(itemData.item)") ({{ itemData.item.objref.koodi.arvo }})
        li.subheader(v-if="!isSubmenu && !itemRoute")
          span {{ kaanna(itemData.item) }}
        ops-sidenav-link.submenu(
          v-if="isSubmenu",
          :itemData="itemData",
          :to="itemRoute",
          :click="navigate")
          a.btn.btn-link {{ kaanna(itemData.item) }}
          fas(icon="chevron-right", v-if="!itemData.item.hideChevron")
    li
      ep-sisalto-modaali(:params="$route", :cache="cache")
    router-link(tag="li", :to="{ name: 'jarjesta' }")
      fas(icon="sort")
      a.btn.btn-link {{ $t('jarjesta') }}

</template>

<style scoped lang="scss" src="./style.scss"></style>
<script lang="ts" src="./script.ts"></script>
