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
    :multiple="multiple"
    :class="inputClass")
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
  small.form-text.text-muted(v-if="help") {{ $t(help) }}

</template>

<script lang="ts">
import { Component, Prop, Model, Mixins } from 'vue-property-decorator';

import Multiselect from 'vue-multiselect';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpInput from '@/components/forms/EpInput.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpValidation from '@/mixins/EpValidation';

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
    // type: Array
  })
  private value!: any[] | any;

  @Prop({
    default: false,
  })
  private multiple!: boolean;

  @Prop()
  private trackBy!: string;

  @Prop({ required: true })
  private options!: any[];

  @Prop({ default: '' })
  private help!: string;

  get model() {
    return this.value;
  }

  get track() {
    return this.trackBy;
  }

  private changed(value: any) {
    this.$emit('input', value);
  }

  get inputClass() {
    return {
      'is-invalid': this.isInvalid,
      'is-valid': this.isValid,
    };
  }
}
</script>

<style scoped lang="scss">

/deep/ .multiselect__tags {
  border: none;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 0;
  -webkit-appearance: none;
}


/deep/ .is-invalid .multiselect__tags {
  border-color: #dc3545;
}

/deep/ .is-valid .multiselect__tags {
  border-color: #28a745;
}

// Piilotettu Bootstrapissa oletuksena
/deep/ .invalid-feedback,
/deep/ .valid-feedback {
  display: block;
}

</style>
