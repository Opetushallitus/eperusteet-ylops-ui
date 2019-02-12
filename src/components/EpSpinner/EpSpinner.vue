<template lang="pug">
div
  .spinner
    .oph-spinner(aria-label="Ladataan")
      .oph-bounce.oph-bounce1
      .oph-bounce.oph-bounce2
      .oph-bounce.oph-bounce3
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class EpSpinner extends Vue {
}

</script>

<style scoped lang="scss">
.spinner {
  margin-top: 5px;
}
</style>
