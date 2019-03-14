<template lang="pug">
.form-group.form-content
  label {{ $t(name) }}
  slot
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

/**
 * Tämän komponentin tehtävä on ainoastaan esittää label lomakekentälle
 */
@Component
export default class EpFormContent extends Vue {
  @Prop({ required: true })
  private name!: string;
}
</script>

<style scoped lang="scss">
.form-content {
  margin: 0 0 30px 0;

  label {
    font-weight: 600;
  }
}
</style>
