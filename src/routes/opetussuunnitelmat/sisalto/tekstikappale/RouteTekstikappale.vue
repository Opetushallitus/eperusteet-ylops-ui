<template lang="pug">
.content
  tekstikappale-teksti(
    :ops-id="$route.params.id",
    :osa-id="$route.params.osaId",
    :key="$route.params.osaId",
    :allow-ohje-edit="isPohja")
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
