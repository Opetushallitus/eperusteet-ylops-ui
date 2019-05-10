<template lang="pug">
button.btn(
    :class="'btn-' + variant",
    v-bind="$attrs",
    :disabled="disabled || showSpinner",
    @click="$emit('click')")
  fas.mr-2(v-if="icon", :icon="icon")
  slot
  ep-spinner-inline(v-if="showSpinner")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import EpSpinnerInline from '@/components/EpSpinner/EpSpinnerInline.vue';

@Component({
  components: {
    EpSpinnerInline,
  },
})
export default class EpButton extends Vue {
  @Prop({ default: '' })
  private icon!: string;

  @Prop({ default: false })
  private disabled!: boolean;

  @Prop({ default: false })
  private showSpinner!: boolean;

  @Prop({ default: 'primary' })
  private variant!: boolean;


}
</script>
