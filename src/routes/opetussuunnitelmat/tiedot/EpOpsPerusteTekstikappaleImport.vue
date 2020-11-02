<template>
  <div class="content">
    <h2>{{$t('paivita-opetussuunnitelma')}}</h2>
    <div v-html="$t('paivita-opetussuunnitelma-huomioteksti')" />

    <div class="text-right">
      <ep-button @click="paivita" :showSpinner="paivitys">
        {{$t('paivita-opetussuunnitelma')}}
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
export default class EpOpsPerusteTekstikappaleImport extends Vue {
  @Prop({ required: true })
  private opetussuunnitelmaStore!: OpetussuunnitelmaStore;

  private paivitys = false;

  async paivita() {
    this.paivitys = true;
    try {
      await this.opetussuunnitelmaStore.importPerusteTekstit();
      this.$success(this.$t('perusteen-tekstikappaleet-tuotu-opetussuunitelmaan') as string);
      await this.opetussuunnitelmaStore.init();
    }
    catch (e) {
      this.$fail(this.$t('perusteen-tekstikappaleet-tuotu-opetussuunitelmaan-virhe') as string);
      createLogger('EpOpsPerusteTekstikappaleImport').error(e);
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
    background-color: $blue-lighten-4;
    border-radius: 0.5rem;
 }
</style>
