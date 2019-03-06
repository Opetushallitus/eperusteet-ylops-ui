<template lang="pug">
.form-group.form-content
  label {{ $t(name) }}:
  slot
  .valid-feedback(v-if="!validationError && validMessage") {{ $t(validMessage) }}
  .invalid-feedback(v-else-if="validationError && invalidMessage ") {{ $t(invalidMessage) }}
  .invalid-feedback(v-else-if="validationError && !invalidMessage") {{ $t('validation-error-' + validationError, validation.$params[validationError]) }}
  small.form-text.text-muted(v-if="help") {{ $t(help) }}
</template>

<script lang="ts">
import { Component, Prop, Mixins } from "vue-property-decorator";
import EpValidation from '@/mixins/EpValidation';

@Component
export default class EpFormContent extends Mixins(EpValidation) {
  @Prop({ required: true })
  private name!: string;

  @Prop({ default: '' })
  private help!: string;
}
</script>

<style scoped lang="scss">

.form-content {
  margin: 0 0 30px 0;

  label {
    font-weight: 600;
  }

  .form-data {
    margin-top: -5px;
    padding-left: 2px;
  }

  .invalid-feedback, .valid-feedback {
    display: block;
  }
}

</style>
