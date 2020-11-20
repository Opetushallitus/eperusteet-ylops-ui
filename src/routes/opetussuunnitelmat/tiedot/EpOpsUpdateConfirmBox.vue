<template>
  <div class="content">
    <h2>{{$t(topic)}}</h2>
    <div v-html="$t(text)" />

    <div class="d-flex justify-content-end">
      <slot name="footertext" />
      <ep-button @click="sync" :showSpinner="paivitys">
        {{$t(buttonText)}}
      </ep-button>
    </div>

  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { createLogger } from '@shared/utils/logger';

@Component({
  components: {
    EpButton,
  },
})
export default class EpOpsUpdateConfirmBox extends Vue {
  @Prop({ required: true })
  private opetussuunnitelmaStore!: OpetussuunnitelmaStore;

  @Prop({ required: true })
  private successText!: string;

  @Prop({ required: true })
  private failText!: string;

  @Prop({ required: true })
  private topic!: string;

  @Prop({ required: true })
  private text!: string;

  @Prop({ required: true })
  private buttonText!: string;

  @Prop({ required: true })
  private function!: Function;

  private paivitys = false;

  async sync() {
    this.paivitys = true;
    try {
      await this.function();
      this.$success(this.$t(this.successText) as string);
      await this.opetussuunnitelmaStore.init();
    }
    catch (e) {
      this.$fail(this.$t(this.failText) as string);
      createLogger('EpOpsUpdateConfirmBox').error(e);
    }
    this.paivitys = false;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .content{
    margin-left: 10px;
    padding: 20px;
    border-radius: 0.5rem;
 }
</style>
