<template lang="pug">
  span {{ formatted }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import moment from 'moment';

@Component({
  name: 'EpAikaleima',
})
export default class EpAikaleima extends Vue {

  private static Formats: { [key: string]: string } = {
    ldt: 'LLL',
    ld: 'LL',
    lt: 'H:mm:ss',
    sdt: 'D.M.YYYY H:mm',
    sd: 'D.M.YYYY',
    st: 'H:mm',
  };

  @Prop({
    required: true,
  })
  private value!: any;

  @Prop({ default: 'sdt' })
  private type!: string;

  @Prop()
  private format!: string;

  get formatted() {
    // Pakko olla, jotta localen vaihtuessa komponentti päivittyy
    if (this.$i18n) {
      this.$i18n.locale; // tslint:disable-line
    }

    if (this.format) {
      return moment(this.value).format(this.format);
    } else if (this.type === 'ago') {
      return moment(this.value).fromNow();
    } else {
      const defaultKey = 'sdt';
      const selectedFormat = EpAikaleima.Formats[this.type]
        || EpAikaleima.Formats[defaultKey];
      return moment(this.value).format(selectedFormat);
    }
  }
}
</script>
