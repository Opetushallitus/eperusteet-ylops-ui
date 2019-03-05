<template lang="pug">
input.input-style.form-control(
  v-if="isEditing",
  @input="onInput($event.target.value)",
  :attrs="$attrs",
  :value="val",
  :class="{ 'is-invalid': validation && validation.$invalid && validation.$dirty, 'is-valid': validation && !validation.$invalid && validation.$dirty }")
.input-content(
  v-else,
  :attrs="$attrs")
  | {{ val }}

</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';
import { createLogger } from '@/stores/logger';

const logger = createLogger('EpInput');


@Component
export default class EpInput extends Vue {

  @Prop({ default: false })
  private isString!: boolean;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ required: true })
  private value!: string | object;

  @Prop()
  private validation!: object;

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
      (this.validation as any).$touch();
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
    //border-bottom: 1px solid #47a4f5;
    outline: none !important;
    box-shadow: none !important;
  }
}

.input-content {
  padding: 6px 0 6px 0;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 400;
}

</style>
