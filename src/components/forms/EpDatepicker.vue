<template lang="pug">
div(v-if="isEditing")
  date-picker(
    @input="onInput",
    :format="format",
    :value="value",
    :lang="lang",
    :type="type",
    :input-class="inputClass",
    :class="{ 'is-invalid': isInvalid, 'is-valid': isValid }"
    :width="'100%'",
    :clearable="!validation",
    :append-to-body="true",
    :first-day-of-week="1")
    fas.fa-fw(slot="calendar-icon", icon="calendar-day")
    fas.fa-fw(slot="mx-clear-icon", icon="times")
  .valid-feedback(v-if="!validationError && validMessage") {{ $t(validMessage) }}
  .invalid-feedback(v-else-if="validationError && invalidMessage ") {{ $t(invalidMessage) }}
  .invalid-feedback(v-else-if="validationError && !invalidMessage") {{ $t('validation-error-' + validationError, validation.$params[validationError]) }}
  small.form-text.text-muted(v-if="help && isEditing") {{ $t(help) }}
div(v-else)
  | {{ locdate }}
</template>

<script lang="ts">

import { Component, Prop, Mixins } from "vue-property-decorator";
import _ from 'lodash';
import DatePicker from 'vue2-datepicker';
import { Kielet } from '@/stores/kieli';
import { EpFormContent } from '@/components';
import EpValidation from '@/mixins/EpValidation';


@Component({
  components: {
    DatePicker,
    EpFormContent,
  },
})
export default class EpDatepicker extends Mixins(EpValidation) {

  @Prop({ required: true })
  private value!: any;

  @Prop({
    default: 'date',
    validator(value) {
      return _.includes(['date', 'datetime'], value);
    },
  })
  private type!: string;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ default: '' })
  private help!: string;

  get inputClass() {
    if (this.isInvalid) {
      return 'form-control ep-datepicker-validation is-invalid';
    }
    else if (this.isValid) {
      return 'form-control ep-datepicker-validation is-valid';
    }
    else {
      return 'form-control';
    }
  }

  get locdate() {

    if (this.type === 'datetime') {
      return (this as any).$ldt(this.value);
    }
    else {
      return (this as any).$ld(this.value);
    }
  }

  get format() {
    if (this.type === 'datetime') {
      return 'D.M.YYYY H:mm';
    }
    else {
      return 'D.M.YYYY';
    }
  }

  get lang() {
    return Kielet.getAikakaannokset();
  }

  private onInput(event: any) {
    this.$emit('input', event);
    if (this.validation) {
      (this.validation as any).$touch();
    }
  }

}
</script>

<style lang="scss">
.mx-input-append {
  font-size: 1rem;
}
.ep-datepicker-validation {
  padding-right: calc(3em + .75rem) !important;
}
.ep-datepicker-validation ~ .mx-input-append {
  right: 30px;
}
.invalid-feedback, .valid-feedback {
  display: block;
}
</style>
