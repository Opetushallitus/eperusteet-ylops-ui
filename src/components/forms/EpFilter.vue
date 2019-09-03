<template lang="pug">
.filter-search
  .inlay
    fas.inner-icon(icon="search")
  .search
    input.form-control(
      type="text",
      :placeholder="$t('etsi')"
      @input="onInput($event.target.value)",
      :attrs="$attrs",
      :value="val")
</template>

<script lang="ts">
import { Component, Prop, Mixins, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';
import { createLogger } from '@/stores/logger';
import EpValidation from '@/mixins/EpValidation';

const logger = createLogger('EpInput');

@Component
export default class EpFilter extends Vue {
  @Prop({ required: true })
  private value!: string | object;

  @Prop({ default: '' })
  private help!: string;

  public onInput(input: any) {
    this.$emit('input', input);
  }

  get val() {
    if (_.isObject(this.value)) {
      return (this.value as any)[Kielet.getSisaltoKieli()];
    }
    else {
      return this.value;
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.filter-search {
  margin-top: -14px;

  .inlay {
    .inner-icon {
      color: #575757;
      position: relative;
      float: left;
      top: 27px;
      left: 10px;
    }
  }

  .search {

    input.form-control {
      background: #F3F3F3;
      border: none;
      border-radius: 15px;
      padding-left: 36px;
    }
  }
}
</style>
