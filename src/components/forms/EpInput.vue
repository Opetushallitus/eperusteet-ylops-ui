<template lang="pug">

input.input-style.form-control(
  v-if="isObject && isEditing"
  :attrs="$attrs"
  v-model="model[kieli]")

div.input-content(
  v-else-if="isObject && !isEditing"
  :attrs="$attrs")
  | {{ model[kieli] }}

input.input-style.form-control(
  v-else-if="!isObject && isEditing"
  :attrs="$attrs"
  v-model="model")

div.input-content(
  v-else
  :attrs="$attrs")
  | {{ model }}

</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';


@Component
export default class RouteTiedot extends Vue {
  @Prop({ default: false })
  private isEditing!: boolean;

  @Model('change', { required: true })
  private model!: string | object;

  get kieli() {
    return Kielet.getSisaltoKieli();
  }

  get isObject() {
    return _.isObject(this.model);
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
    border-bottom: 1px solid #47a4f5;
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
