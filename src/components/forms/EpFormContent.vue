<template lang="pug">
.form-group.form-content
  label {{ $t(name) }}:
  slot
  small(v-if="help").form-text.text-muted {{ $t(help) }}
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';

@Component
export default class extends EpFormContent Vue {
  @Prop({ required: true })
  private name!: string;

  @Prop({ default: '' })
  private help!: string;

}
</script>

<style scoped lang="scss">

.form-content {
  padding: 20px;

  label {
    font-weight: 600;
  }

  .form-data {
    margin-top: -5px;
    padding-left: 2px;
  }
}

</style>
