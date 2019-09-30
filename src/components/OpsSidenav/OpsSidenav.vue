<template lang="pug">
.sidebar
  .search
    // Todo: filter navi
    ep-search()

  ul.navigation(v-if="valikkoData.length > 0")
    ep-recursive-nav(:value="valikkoData")
      template(v-slot:previousLink="{ itemData, itemRoute, navigate }")
        li.previous-link
          ops-sidenav-link.back-btn(tag="span", :click="navigate", :clickParams="false")
            fas(icon="chevron-left")
          ops-sidenav-link.previous-link(tag="span", :to="itemRoute")
            a.btn.btn-link {{ kaanna(itemData.item) }}

      template(v-slot="{ itemData, isPreviousLink, isSubmenu, navigate, itemRoute }")
        ops-sidenav-link(:to="itemRoute",
          :class="{ 'module-link': onkoModTaiOj(itemData.item) }",
          v-if="!isSubmenu && itemRoute")
          a.btn.btn-link
            ep-color-ball.mr-2(
              v-if="onkoModTaiOj(itemData.item)",
              :kind="itemData.item.objref.pakollinen ? 'pakollinen': 'valinnainen'")
            span {{ kaanna(itemData.item) }}
            span.code-field(v-if="itemData.item.type === 'moduuli'") ({{ haeModuuliKoodi(itemData.item) }})
        li.subheader(v-if="!isSubmenu && !itemRoute")
          span {{ kaanna(itemData.item) }}
        ops-sidenav-link.submenu(
          v-if="isSubmenu",
          :itemData="itemData",
          :to="itemRoute",
          :click="navigate")
          a.btn.btn-link {{ kaanna(itemData.item) }}
          fas(icon="chevron-right", v-if="!itemData.item.hideChevron")

      template(v-slot:after="{ itemData, isPreviousLink, isSubmenu, navigate, itemRoute }")
        li(v-if="itemData.item.type === 'tekstikappale'")
          router-link.btn.btn-link(:to=`{ name: 'tekstikappale', params: { osaId: 'uusi', parentId: itemRoute.params.osaId } }`)
            fas.mr-2(icon="plus")
            span {{ $t('uusi-tekstikappale') }}

</template>

<style scoped lang="scss" src="./style.scss"></style>
<script lang="ts" src="./script.ts"></script>
