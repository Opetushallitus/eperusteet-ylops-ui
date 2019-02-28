<template lang="pug">
.form-group.form-content
  label {{ $t(name) }}:
  slot
  small(v-if="help").form-text.text-muted {{ $t(help) }}
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';

@Component
export default class EpFormContent extends Vue {
  @Prop({ required: true })
  private name!: string;

  @Prop({ default: '' })
  private help!: string;

}
</script>

<style scoped lang="scss">

.form-content {
  margin: 0 40px 40px 0;

  label {
    font-weight: 600;
  }

  .form-data {
    margin-top: -5px;
    padding-left: 2px;
  }
}

</style>
