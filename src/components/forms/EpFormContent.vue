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
import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import _ from 'lodash';

@Component
export default class EpFormContent extends Vue {
  @Prop({ required: true })
  private name!: string;

  @Prop({ default: '' })
  private help!: string;

  @Prop({ default: '' })
  private validMessage!: string;

  @Prop({ default: '' })
  private invalidMessage!: string;

  @Prop({ default: null })
  private validation!: any;

  get validationError() {
    if (this.validation && this.validation.$dirty) {
      return _(this.validation)
        .keys()
        .reject(key => _.startsWith(key, '$'))
        .reject(key => this.validation[key])
        .head();
    } else {
      return '';
    }
  }
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
