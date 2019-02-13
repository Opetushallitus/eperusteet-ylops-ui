<template lang="pug">
button.oph-button.oph-button-primary(
    v-bind="$attrs"
    @click="$emit('click')")
  slot(name="content")
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
  @Prop({
    default: false,
  })
  private showSpinner!: boolean;

}
</script>
