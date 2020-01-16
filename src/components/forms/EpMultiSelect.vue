<template>
<div>
  <multiselect :value="model"
               :track-by="track"
               :options="options"
               :close-on-select="true"
               :clear-on-select="true"
               :placeholder="''"
               :internalSearch="false"
               select-label=""
               selected-label=""
               deselect-label=""
               @search-change="$emit('search', $event)"
               @input="changed($event)"
               :multiple="multiple"
               :class="inputClass">
    <template slot="singleLabel"
              slot-scope="{ option }">
      <slot name="singleLabel" :option="option"></slot>
    </template>
    <template slot="option" slot-scope="{ option, search }">
      <slot name="option" :option="option" :search="search"></slot>
    </template>
    <template
      slot="tag" slot-scope="{ option, search, remove }">
      <slot name="tag" :option="option" :search="search" :remove="remove"></slot>
    </template>
    <template slot="noResult">
      <div>{{ $t('ei-hakutuloksia') }}</div>
    </template>
    <template slot="noOptions">
      <div>{{ $t('ei-vaihtoehtoja') }}</div>
    </template>
  </multiselect>
  <div class="valid-feedback" v-if="!validationError && validMessage">{{ $t(validMessage) }}</div>
  <div class="invalid-feedback" v-else-if="validationError && invalidMessage ">{{ $t(invalidMessage) }}</div>
  <div class="invalid-feedback" v-else-if="validationError && !invalidMessage">{{ $t('validation-error-' + validationError, validation.$params[validationError]) }}</div>
  <small class="form-text text-muted" v-if="help">{{ $t(help) }}</small>
</div>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';

import Multiselect from 'vue-multiselect';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
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
@import '@shared/styles/_variables.scss';

/deep/ .multiselect__tags {
  border: 1px solid;
  border-radius: 6px;
  appearance: none;
  padding: 4px 40px 4px 8px;
}


/deep/ .is-invalid .multiselect__tags {
  border-color: #dc3545;
}

/deep/ .is-valid .multiselect__tags {
  border-color: $valid;
}

// Piilotettu Bootstrapissa oletuksena
/deep/ .invalid-feedback,
/deep/ .valid-feedback {
  display: block;
}

</style>
