<template lang="pug">
ep-input.form-data(
  :value="value",
  @input="$emit('input', $event)",
  :is-editing="isEditing",
  :is-header="isHeader",
  :type="type",
  :validation="validation",
  :help="help")
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';

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
  private value!: string | object;

  @Prop({ default: false })
  private isHeader!: boolean;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ default: 'localized' })
  private type!: 'localized' | 'string' | 'number';

  @Prop({ default: '' })
  private help!: string;
}
</script>
