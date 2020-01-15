<template>
<div class="ep-button" ref="button-container">
  <button class="btn"
          :class="variantClass"
          v-bind="$attrs"
          :disabled="disabled || showSpinner"
          @click="$emit('click')">
    <div v-if="icon"
         :class="[iconClass, isOutline && 'icon']"
         >
      <fas :icon="icon" fixed-width />
    </div>
    <slot />
    <ep-spinner-inline v-if="showSpinner" :link="variant ==='link'"/>
  </button>
  <b-tooltip v-if="help" :target="() => $refs['button-container']">{{ $t(help) }}</b-tooltip>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSpinnerInline from '@shared/components/EpSpinner/EpSpinnerInline.vue';


@Component({
  components: {
    EpSpinnerInline,
    EpSpinner,
  },
})
export default class EpButton extends Vue {
  @Prop({ default: '' })
  private icon!: string;

  @Prop({ default: ''})
  private buttonClass!: string;

  @Prop({ default: 'float-left mr-2'})
  private iconClass!: string;

  get isOutline() {
    return _.startsWith(this.variant, 'outline');
  }

  get variantClass() {
    let result = this.buttonClass + ' btn-' + this.variant;
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

  @Prop({ default: '' })
  private help!: string;
}
</script>

<style lang="scss" scoped>
.ep-button {
  display: inline-block;

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

}
</style>
