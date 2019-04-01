<template lang="pug">
.sidebar
  .search
    .inlay
      input.form-control.megasearch(type="text" placeholder="Etsi")
      fas.inner-icon(icon="search")

  ul.navigation(v-if="opsLapset.length>0")
    ep-recursive-nav(:value="valikkoData")
      template(v-slot:previousLink="{ itemData, navigate }")
        li.submenu(@click="navigate()")
          fas(icon="chevron-left")
          a.btn.btn-link {{ kaanna(itemData.item) }}
      template(v-slot="{ itemData, isPreviousLink, isSubmenu, navigate, itemRoute }")
        router-link(tag="li", :to="itemRoute", v-if="!isSubmenu && itemRoute")
          a.btn.btn-link {{ kaanna(itemData.item) }}
        li.submenu(v-if="isSubmenu", @click="navigate(itemData)")
          a.btn.btn-link {{ kaanna(itemData.item) }}
          fas(icon="chevron-right")

    // li
      button.btn.btn-primary(@click="addTekstikappale()")
        fas.mr-2(icon="plus")
        span {{ $t('lisaa-tekstikappale') }}

    li
      ep-sisalto-modaali(:params="$route", :cache="cache")

</template>

<style scoped lang="scss" src="./style.scss"></style>
<script lang="ts" src="./script.ts"></script>
