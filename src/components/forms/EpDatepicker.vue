<template lang="pug">
div(v-if="isEditing")
  date-picker(
    :format="format",
    :value="value",
    @input="onInput",
    :lang="lang",
    :type="type")
div(v-else)
  | {{ locdate }}
</template>

<script lang="ts">

import { Vue, Component, Prop, Model } from 'vue-property-decorator';
import _ from 'lodash';
import DatePicker from 'vue2-datepicker';
import { Kielet } from '@/stores/kieli';
import { EpFormContent } from '@/components';


@Component({
  components: {
    DatePicker,
    EpFormContent,
  },
})
export default class EpDatepicker extends Vue {

  @Prop({ default: false })
  private isEditing!: any;

  @Prop({ required: true })
  private value!: any;

  @Prop()
  private validation!: object;

  @Prop({
    default: 'date',
    validator(value) {
      return _.includes(['date', 'datetime'], value);
    },
  })
  private type!: string;

  get locdate() {
    
    if (this.type === 'datetime') {
      return (this as any).$ldt(this.value);
    }
    else {
      return (this as any).$ld(this.value);
    }
  }

  get format() {
    if (this.type === 'datetime') {
      return 'D.M.YYYY H:mm';
    }
    else {
      return 'D.M.YYYY';
    }
  }

  get lang() {
    return Kielet.getAikakaannokset();
  }

  private onInput(event: any) {
    this.$emit('input', event);
    if (this.validation) {
      (this.validation as any).$touch();
    }
  }

}
</script>

<style scoped lang="scss">
</style>
