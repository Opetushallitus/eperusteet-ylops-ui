<template>
  <div class="ep-checkbox">
    <b-form-checkbox 
      :value="value"
      @input="$emit('input', $event)">
      <slot></slot>
    </b-form-checkbox>
  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import _ from 'lodash';
import EpFormContent from './EpFormContent.vue';

@Component({
  components: {
    EpFormContent,
  },
})
export default class EpToggle extends Vue {
  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ required: true })
  private value!: boolean;
}
</script>

<style scoped lang="scss">

.ep-checkbox {
  margin: 0px 0 6px 0;
}

</style>
