<template lang="pug">
div.filter
  span.form-control-feedback
    fas(icon="search")
  input.form-control(
    type="search",
    :placeholder="placeholderText",
    @input="onInput($event.target.value)",
    :value="val")
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';

@Component({
  name: 'EpSearch',
})
export default class EpSearch extends Vue {
  @Prop()
  private value!: string;

  @Prop()
  private placeholder!: string;

  get placeholderText() {
    return this.placeholder || this.$t('etsi');
  }

  public onInput(input: any) {
    this.$emit('input', input);
  }

  get val() {
    if (_.isObject(this.value)) {
      return (this.value as any)[Kielet.getSisaltoKieli];
    }
    else {
      return this.value;
    }
  }
}
</script>

<style scoped lang="scss">

.filter .form-control {
  padding-left: 2.375rem;
  border-radius: 15px;
  background: #F3F3F3;
  border-width: 0;

  &::placeholder {
    color: #aaa;
  }

}

.filter .form-control-feedback {
  position: absolute;
  z-index: 2;
  display: block;
  width: 2.375rem;
  height: 2.375rem;
  line-height: 2.375rem;
  text-align: center;
  pointer-events: none;
  color: #aaa;
}

</style>
