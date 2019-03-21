<template lang="pug">
div.form-group.has-search
  span.form-control-feedback
    fas(icon="search")
  input.form-control.mb-3(
    ref="search",
    type="search",
    :placeholder="placeholder || $t('etsi')",
    :value="value",
    @input="updateSearch()")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'EpAikaleima',
})
export default class EpSearch extends Vue {
  @Prop()
  private value!: string;

  @Prop()
  private placeholder!: string;

  private updateSearch() {
    this.$emit('input', (this as any).$refs.search.value);
  }
}
</script>

<style scoped lang="scss">

.has-search .form-control {
  padding-left: 2.375rem;
  border-radius: 15px;
  background: #F3F3F3;
  border-width: 0;

  &::placeholder {
    color: #aaa;
  }

}

.has-search .form-control-feedback {
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
