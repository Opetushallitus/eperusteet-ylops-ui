<template lang="pug">
button.oph-button.oph-button-primary(
    :disabled="disabled"
    @click="$emit('click')")
  ep-spinner-inline(v-if="showSpinner")
  slot(name="content")
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
    default: false,
  })
  private disabled!: boolean;

  @Prop({
    default: false,
  })
  private showSpinner!: boolean;

}
</script>