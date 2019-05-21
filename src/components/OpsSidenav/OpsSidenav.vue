<template lang="pug">
.sidebar
  .search
    .inlay
      input.form-control.megasearch(type="text" placeholder="Etsi")
      fas.inner-icon(icon="search")

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
          ep-color-ball(
            v-if="onkoModTaiOj(itemData.item)",
            :kind="itemData.item.objref.pakollinen ? 'pakollinen': 'normaali'")
          a.btn.btn-link
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

  .bottom-navigation
    .hallintalinkit
      .hallintatoggle(@click="toggleHallinta", role="button")
        span {{ $t('hallintatyokalut') }}
        .float-right
          fas.hallintachevron(v-if="showHallintatyokalut", icon="chevron-down")
          fas.hallintachevron(v-else, icon="chevron-up")
      ul.navigation(v-if="showHallintatyokalut")
        li
          router-link.btn.btn-link(:to=`{ name: 'opsTiedot' }`)
            fas.mr-2(icon="info-circle")
            span {{ $t('tiedot') }}
        li
          router-link.btn.btn-link(:to=`{ name: 'opsDokumentti' }`)
            fas.mr-2(icon="file-pdf")
            span {{ $t('dokumentti') }}
        li
          router-link.btn.btn-link(:to=`{ name: 'opsPoistetut' }`)
            fas.mr-2(icon="recycle")
            span {{ $t('poistetut') }}
        li
          router-link.btn.btn-link(:to=`{ name: 'opsKasitteet' }`)
            fas.mr-2(icon="bookmark")
            span {{ $t('kasitteet') }}
        // li
          router-link.btn.btn-link(:to=`{ name: 'opsRakenne' }`)
            fas.mr-2(icon="cog")
            span {{ $t('rakenne') }}
        li
          router-link.btn.btn-link(:to=`{ name: 'opsJulkaisu' }`)
            fas.mr-2(icon="upload")
            span {{ $t('julkaise') }}

    // li.separated
      ep-sisalto-modaali(:params="$route", :cache="cache")

  //router-link(:to="{ name: 'jarjesta' }")
    fas.mr-2(icon="cog")
    span {{ $t('muokkaa-rakennetta') }}

</template>

<style scoped lang="scss" src="./style.scss"></style>
<script lang="ts" src="./script.ts"></script>
