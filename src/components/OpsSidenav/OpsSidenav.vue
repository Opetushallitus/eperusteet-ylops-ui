<template lang="pug">
.sidebar
  .search
    .inlay
      input.form-control.megasearch(type="text" placeholder="Etsi")
      fas.inner-icon(icon="search")

  ul.navigation(v-if="sisalto")
    ep-recursive-nav(:value="valikkoData")
      template(v-slot:previousLink="{ item, navigate }")
        li.submenu(@click="navigate()")
          fas(icon="chevron-left")
          a.btn.btn-link {{item.name}}
      template(v-slot="{ item, children, isPreviousLink, isSubmenu, navigate, itemRoute }")
        router-link(tag="li", :to="itemRoute", v-if="!isSubmenu && itemRoute")
          a.btn.btn-link {{item.name}}
        li.submenu(v-if="isSubmenu", @click="navigate(item, children)")
          a.btn.btn-link {{item.name}}
          fas(icon="chevron-right")

    li
      button.btn.btn-primary(@click="addTekstikappale()")
        fas(icon="plus")
        | &nbsp;&nbsp;
        span {{ $t('lisaa-tekstikappale') }}
</template>

<style scoped lang="scss" src="./style.scss"></style>
<script lang="ts" src="./script.ts"></script>
