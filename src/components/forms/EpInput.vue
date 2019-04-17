<template lang="pug">

div(v-if="isEditing")
  input.input-style.form-control(
    @input="onInput($event.target.value)",
    :attrs="$attrs",
    :value="val",
    :class="{ 'is-invalid': isInvalid, 'is-valid': isValid }")
  .valid-feedback(v-if="!validationError && validMessage") {{ $t(validMessage) }}
  .invalid-feedback(v-else-if="validationError && invalidMessage ") {{ $t(invalidMessage) }}
  .invalid-feedback(v-else-if="validationError && !invalidMessage") {{ $t('validation-error-' + validationError, validation.$params[validationError]) }}
  small.form-text.text-muted(v-if="help && isEditing") {{ $t(help) }}
.input-content(
    v-else,
    :attrs="$attrs")
    | {{ val }}

</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';
import { createLogger } from '@/stores/logger';
import EpValidation from '@/mixins/EpValidation';

const logger = createLogger('EpInput');

@Component
export default class EpInput extends Mixins(EpValidation) {
  @Prop({ default: false })
  private isString!: boolean;

  @Prop({ required: true })
  private value!: string | object;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ default: '' })
  private help!: string;

  public onInput(input: any) {
    if (this.isString && !_.isString(this.value)) {
      logger.warn('Given value is not a string:', this.value);
    }

    if (!this.isString && !_.isPlainObject(this.value)) {
      logger.warn('Given value is not an object:', this.value);
    }

    if (this.isString || _.isString(this.value)) {
      this.$emit('input', input);
    }
    else {
      this.$emit('input', {
        ...(_.isObject(this.value) ? this.value as any : {}),
        [Kielet.getSisaltoKieli()]: input,
      });
    }
    if (this.validation) {
      this.validation.$touch();
    }
  }

  get val() {
    if (_.isObject(this.value)) {
      return (this.value as any)[Kielet.getSisaltoKieli()];
    }
    else {
      return this.value;
    }
  }
}
</script>

<style scoped lang="scss">
input.input-style {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 500;

  &:focus {
    border-color: #47a4f5;
    outline: none !important;
    box-shadow: none !important;
  }
}

input.is-invalid:focus {
  border-color: #dc3545;
}

input.is-valid:focus {
  border-color: #28a745;
}

.input-content {
  padding: 6px 0 6px 0;
  font-size: 1rem;
  line-height: 1.5;
}

</style>
