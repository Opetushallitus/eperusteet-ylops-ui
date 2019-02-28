<template lang="pug">
// ep-form-content()
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
</style>
