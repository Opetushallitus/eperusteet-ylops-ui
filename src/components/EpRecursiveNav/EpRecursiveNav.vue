<template lang="pug">
.valikko
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
    div.alivalikko(v-if="item.flatten")
      .subitem(v-for="subitem in item.children")
        slot(
          :itemData="subitem",
          :isSubmenu="isSubmenu(subitem)",
          :itemRoute="subitem.route",
          :navigate="enterSubmenu")
</template>

<script lang="ts" src="./script.ts"/>
