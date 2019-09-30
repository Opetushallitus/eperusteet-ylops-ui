<template lang="pug">

div(v-if="isEditing")
  div(v-if="items && (!multiple || innerModel)")
    select.form-control(
      v-model="innerModel",
      :multiple="multiple",
      @change="updateValue()",
      :class="{ 'is-invalid': isInvalid, 'is-valid': isValid }")
      option(disabled, :value="null")
      option(v-for="item in items", :value="item")
        slot(name="default", :item="item") {{ item }}
    .valid-feedback(v-if="!validationError && validMessage") {{ $t(validMessage) }}
    .invalid-feedback(v-else-if="validationError && invalidMessage ") {{ $t(invalidMessage) }}
    .invalid-feedback(v-else-if="validationError && !invalidMessage") {{ $t('validation-error-' + validationError, validation.$params[validationError]) }}
    small.form-text.text-muted(v-if="help && isEditing") {{ $t(help) }}
  ep-spinner(v-else)
div(v-else)
  ul
    li(v-for="item in value")
      slot(name="default", :item="item")
        span {{ item }}

</template>

<script lang="ts">
import { Component, Prop, Model, Mixins } from 'vue-property-decorator';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpInput from '@/components/forms/EpInput.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpValidation from '@/mixins/EpValidation';
import _ from 'lodash';

@Component({
  components: {
    EpContent,
    EpInput,
    EpSpinner,
  },
})
export default class EpSelect extends Mixins(EpValidation) {
  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ required: true })
  private items!: any[];

  @Prop({ required: true })
  private value!: any | any[];

  @Prop({ default: true })
  private useCheckboxes!: boolean;

  @Prop({ default: false })
  private multiple!: boolean;

  @Prop({ default: '' })
  private help!: string;

  private innerModel: any | any[] | null = null;

  private updateValue() {
    if (_.isArray(this.innerModel)) {
      this.$emit('input', [...this.innerModel]);
    }
    else {
      this.$emit('input', this.innerModel);
    }

    if (this.validation) {
      this.validation.$touch();
    }
  }

  mounted() {
    this.innerModel = this.value;
  }
}
</script>

<style scoped lang="scss">
.form-content {
  padding: 20px;

  label.content-label {
    font-weight: 600;
  }

  .form-data {
    margin-top: -5px;
    padding-left: 2px;
  }

  select {
    overflow-y: auto;
  }
}

select {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  -webkit-appearance: none;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 500;

  &:focus {
    border-color: #47a4f5;
    outline: none !important;
    box-shadow: none !important;
  }
}

</style>
