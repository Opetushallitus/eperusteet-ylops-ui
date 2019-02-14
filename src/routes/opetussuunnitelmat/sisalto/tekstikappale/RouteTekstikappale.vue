<template lang="pug">
.content
  tekstikappale-teksti(:value="root")
</template>

<script lang="ts" src="./script.ts"></script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.badges {
  .badge {
    margin: 4px;
  }
}

</style>
