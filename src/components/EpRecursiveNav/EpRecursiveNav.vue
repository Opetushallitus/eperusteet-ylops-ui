<template lang="pug">
.valikko
  .item(v-for="item in current")
    slot(:item="item.item", :children="item.children", :navigate="vaihdaValikkoa")
    div(v-if="item.flatten" style="margin-left: 20px")
      .subitem(v-for="subitem in item.children")
        slot(:item="subitem.item", :children="subitem.children", :navigate="vaihdaValikkoa")
</template>

<script lang="ts" src="./script.ts"/>