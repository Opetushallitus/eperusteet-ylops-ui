<template lang="pug">
.valikko
  slot(
    name="previousLink",
    v-if="navStack.length>0",
    :item="previous",
    :navigate="palaaTakaisin")
  .item(v-for="item in current")
    slot(
      :item="item.item",
      :children="item.children",
      :isSubmenu="isSubmenu(item)",
      :itemRoute="item.route",
      :navigate="vaihdaValikkoa")

    div.alivalikko(v-if="item.flatten")
      .subitem(v-for="subitem in item.children")
        slot(
          :item="subitem.item",
          :children="subitem.children",
          :isSubmenu="isSubmenu(subitem)",
          :itemRoute="subitem.route",
          :navigate="vaihdaValikkoa")
</template>

<script lang="ts" src="./script.ts"/>
