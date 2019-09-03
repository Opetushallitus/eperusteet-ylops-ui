<template>
<button class="round-button"
  :class="'round-button-' + variant"
  v-bind="$attrs"
  :disabled="disabled"
  @click="$emit('click')">
  <fas :icon="icon" />
</button>
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
  @Prop({
    required: true,
    type: String,
  })
  private icon!: string;

  @Prop({
    default: false,
    type: Boolean,
  })
  private disabled!: boolean;

  @Prop({ default: 'primary' })
  private variant!: boolean;
}
</script>

<style lang="scss" scoped>

.round-button {
  border-radius: 100%;
  background: #668eea;
  border: none;
  color: #fff;
  display: inline-block;
  min-height: 32px;
  min-width: 32px;
  outline: none;
  font-size: 1.2em;
}

.round-button-lightblue {
  background: #668eea;
}

.round-button-green {
  background: #f166c0;
}

.round-button-pink {
  background: #62ac32;
}

</style>
