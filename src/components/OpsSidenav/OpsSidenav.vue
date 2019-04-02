<template lang="pug">
.sidebar
  .search
    .inlay
      input.form-control.megasearch(type="text" placeholder="Etsi")
      fas.inner-icon(icon="search")

  ul.navigation(v-if="opsLapset.length>0")
    ep-recursive-nav(:value="valikkoData")
      template(v-slot:previousLink="{ itemData, navigate }")
        li.previous-link(@click="navigate()")
          fas(icon="chevron-left")
          a.btn.btn-link {{ kaanna(itemData.item) }}
      template(v-slot="{ itemData, isPreviousLink, isSubmenu, navigate, itemRoute }")
        router-link(tag="li",
          :to="itemRoute",
          :class="{ 'module-link': itemData.item.type=='moduuli' }",
          v-if="!isSubmenu && itemRoute"
          )
          ep-color-ball(
            v-if="naytaTilakoodi(itemData.item)",
            :kind="itemData.item.objref.pakollinen ? 'pakollinen': 'normaali'"
            )
          a.btn.btn-link
            span {{ kaanna(itemData.item) }}
            span.code-field(v-if="naytaTilakoodi(itemData.item)") ({{ itemData.item.objref.koodi.arvo }})
        li.subheader(v-if="!isSubmenu && !itemRoute")
          span {{ kaanna(itemData.item) }}
        li.submenu(v-if="isSubmenu", @click="navigate(itemData)")
          a.btn.btn-link {{ kaanna(itemData.item) }}
          fas(icon="chevron-right", v-if="!itemData.item.hideChevron")
    li
      ep-sisalto-modaali()

</template>

<style scoped lang="scss" src="./style.scss"></style>
<script lang="ts" src="./script.ts"></script>
