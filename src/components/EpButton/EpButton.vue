<template lang="pug">
button.btn(
    :class="variantClass",
    v-bind="$attrs",
    :disabled="disabled || showSpinner",
    @click="$emit('click')")
  .float-left.mr-2(v-if="icon", :class="isOutline && 'icon'")
    fas(:icon="icon")
  slot
  ep-spinner-inline(v-if="showSpinner")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpSpinnerInline from '@/components/EpSpinner/EpSpinnerInline.vue';

@Component({
  components: {
    EpSpinnerInline,
  },
})
export default class EpButton extends Vue {
  @Prop({ default: '' })
  private icon!: string;

  get isOutline() {
    return _.startsWith(this.variant, 'outline');
  }

  get variantClass() {
    let result = 'btn-' + this.variant;
    if (this.isOutline) {
      result = 'no-outline ' + result;
    }
    return result;
  }

  @Prop({ default: false })
  private disabled!: boolean;

  @Prop({ default: false })
  private showSpinner!: boolean;

  @Prop({ default: 'primary' })
  private variant!: string;
}
</script>

<style lang="scss" scoped>
button.no-outline {
  border: none;
  color: #2B2B2B;

}

.icon {
  height: 24px;
  width: 24px;
  border-radius: 100%;
  margin: 0;
  padding: 0;
  color: #fff;
  background-color: #3367E3;
}

</style>
