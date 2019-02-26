<template lang="pug">
.form-group.form-content
  label {{ $t(name) }}:
  ep-input.form-data(
    :value="value",
    @input="$emit('input', $event)",
    :is-editing="isEditing")
  small(v-if="help && isEditing").form-text.text-muted {{ $t(help) }}
</template>

<script lang="ts">
import { Vue, Component, Prop, Model } from 'vue-property-decorator';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpInput from '@/components/forms/EpInput.vue';

@Component({
  components: {
    EpContent,
    EpInput,
  },
})
export default class EpField extends Vue {
  @Prop({ required: true })
  private name!: string;

  @Prop({ default: '' })
  private help!: string;

  @Prop({ default: false })
  private isEditing!: boolean;

  @Prop({ required: true })
  private value!: string | object;

}
</script>

<style scoped lang="scss">

.form-content {
  padding: 20px;

  label {
    font-weight: 600;
  }

  .form-data {
    margin-top: -5px;
    padding-left: 2px;
  }
}

</style>
