<template lang="pug">
ep-form-content(
  :name="name",
  :help="help",
  :validation="validation"
  :is-editing="isEditing")
  ep-input.form-data(
    :value="value",
    @input="$emit('input', $event)",
    :is-editing="isEditing",
    :is-string="isString",
    :validation="validation")
</template>

<script lang="ts">
import { Component, Prop, Mixins } from "vue-property-decorator";

import EpFormContent from './EpFormContent.vue';
import EpInput from './EpInput.vue';
import EpValidation from '@/mixins/EpValidation';


@Component({
  components: {
    EpFormContent,
    EpInput,
  },
})
export default class EpField extends Mixins(EpValidation) {

  @Prop({ required: true })
  private name!: string;

  @Prop({ default: '' })
  private help!: string;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ default: false })
  private isString!: boolean;

  @Prop({ required: true })
  private value!: string | object;

}
</script>
