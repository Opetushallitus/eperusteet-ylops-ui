<template lang="pug">
.valikko
  .item
    slot(
      name="previousLink",
      v-if="curTopItem",
      :itemData="curTopItem",
      :navigate="previousSubmenu")
  .item(v-for="item in current")
    slot(
      :itemData="item",
      :isSubmenu="isSubmenu(item)",
      :itemRoute="item.route",
      :navigate="enterSubmenu")
    .subitem(v-if="item.flatten", v-for="subitem in item.children")
      slot(
        :itemData="subitem",
        :isSubmenu="isSubmenu(subitem)",
        :itemRoute="subitem.route",
        :navigate="enterSubmenu")
</template>

<script lang="ts" src="./script.ts"/>
