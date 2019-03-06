<template lang="pug">

div(v-if="isEditing")
  div(v-if="items")
    select.form-control(
      v-model="innerModel",
      multiple,
      @change="updateValue($event.target.value)"
      :class="{ 'is-invalid': isInvalid, 'is-valid': isValid }")
      option(disabled value="null")
      option(v-for="item in items" :value="item")
        slot(name="item") {{ item }}
    .valid-feedback(v-if="!validationError && validMessage") {{ $t(validMessage) }}
    .invalid-feedback(v-else-if="validationError && invalidMessage ") {{ $t(invalidMessage) }}
    .invalid-feedback(v-else-if="validationError && !invalidMessage") {{ $t('validation-error-' + validationError, validation.$params[validationError]) }}
    small(v-if="help").form-text.text-muted {{ $t(help) }}
  ep-spinner(v-else)
div(v-else)
  ul
    li(v-for="item in model")
      slot(name="item")
        span {{ item }}

</template>

<script lang="ts">
import { Vue, Watch, Component, Prop, Model } from 'vue-property-decorator';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpInput from '@/components/forms/EpInput.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import _ from 'lodash';

@Component({
  components: {
    EpContent,
    EpInput,
    EpSpinner,
  },
})
export default class RouteTiedot extends Vue {
  @Prop({ required: true })
  private name!: string;

  @Prop({ required: true })
  private items!: any[];

  @Model('change', {
    required: true,
    type: Array,
  })
  private model!: any;

  @Prop({ default: true })
  private useCheckboxes!: boolean;

  @Prop({ default: '' })
  private help!: string;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ default: false })
  private multiple!: boolean;

  @Prop()
  private validation!: any;

  @Prop({ default: '' })
  private validMessage!: string;

  @Prop({ default: '' })
  private invalidMessage!: string;

  get isInvalid() {
    return this.validation && this.validation.$invalid;
  }

  get isValid() {
    return this.validation && !this.validation.$invalid;
  }

  get validationError() {
    if (this.validation) {
      return _(this.validation)
        .keys()
        .reject(key => _.startsWith(key, '$'))
        .reject(key => this.validation[key])
        .head();
    } else {
      return '';
    }
  }

  private innerModel: any = null;

  private updateValue(value: any) {
    this.model.length =  0;
    this.model.push(...this.innerModel);
    if (this.validation) {
      this.validation.$touch();
    }
  }

  mounted() {
    this.innerModel = this.model;
  }

}
</script>

<style scoped lang="scss">

@import './style.scss';

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

</style>
