<template lang="pug">
div
  multiselect(
    :value="model",
    :track-by="track"
    :options="options",
    :close-on-select="true",
    :clear-on-select="true",
    :placeholder="''",
    :internalSearch="false",
    select-label="",
    selected-label="",
    deselect-label="",
    @search-change="$emit('search', $event)",
    @input="changed($event)",
    :multiple="true")
    template(slot="singleLabel", slot-scope="{ option }")
      slot(name="singleLabel", :option="option")

    template(slot="option", slot-scope="{ option, search }")
      slot(name="option", :option="option", :search="search")

    template(slot="tag", slot-scope="{ option, search, remove }")
      slot(name="tag", :option="option", :search="search", :remove="remove")

    template(slot="noResult")
      div {{ $t('ei-hakutuloksia') }}

    template(slot="noOptions")
      div {{ $t('ei-vaihtoehtoja') }}

  .valid-feedback(v-if="!validationError && validMessage") {{ $t(validMessage) }}
  .invalid-feedback(v-else-if="validationError && invalidMessage ") {{ $t(invalidMessage) }}
  .invalid-feedback(v-else-if="validationError && !invalidMessage") {{ $t('validation-error-' + validationError, validation.$params[validationError]) }}

</template>

<script lang="ts">
import { Component, Prop, Model, Mixins } from 'vue-property-decorator';

import Multiselect from 'vue-multiselect';
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
    Multiselect,
  },
})
export default class EpMultiSelect extends Mixins(EpValidation) {
  @Prop({
    required: true,
    type: Array
  })
  private value!: any[];

  @Prop()
  private trackBy!: string;

  @Prop({ required: true })
  private options!: any[];

  get model() {
    return this.value;
  }

  get track() {
    return this.trackBy;
  }

  private changed(value: any) {
    this.$emit('input', value);
  }
}
</script>

<style lang="scss">

.multiselect__tags {
  border: none;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 0;
  -webkit-appearance: none;
}

</style>
