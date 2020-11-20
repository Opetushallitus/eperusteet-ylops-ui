<template>
  <div class="hallintapaneeli">

    <EpOpsUpdateConfirmBox
      class="importbox"
      v-if="!isPohja && perustepaivitys"
      :opetussuunnitelmaStore="opetussuunnitelmaStore"
      :function="importPerusteTekstit"
      topic="paivita-opetussuunnitelma"
      text="paivita-opetussuunnitelma-huomioteksti"
      buttonText="paivita-opetussuunnitelma"
      successText="perusteen-tekstikappaleet-tuotu-opetussuunitelmaan"
      failText="perusteen-tekstikappaleet-tuotu-opetussuunitelmaan-virhe" />

    <EpOpsUpdateConfirmBox
      class="syncBox"
      v-if="isPohja"
      :opetussuunnitelmaStore="opetussuunnitelmaStore"
      :function="synkronisoiPohja"
      topic="paivita-muutokset-opetussuunnitelmiin"
      text="paivita-muutokset-opetussuunnitelmiin-huomioteksti"
      buttonText="paivita-muutokset-opetussuunnitelmiin"
      successText="muutokset-paivitetty-opetussuunnitelmiin"
      failText="muutokset-paivitetty-opetussuunnitelmiin-virhe">
      <div slot="footertext" class="d-flex align-items-end mr-3 disabled-text font-size-08" v-if="ops.viimeisinSyncPvm">
        {{$t('viimeisin-synkronisointi-pvm')}} {{$sd(ops.viimeisinSyncPvm)}}
      </div>
    </EpOpsUpdateConfirmBox>

    <div class="row">
      <div class="col">
        <ops-perustiedot :opetussuunnitelmaStore="opetussuunnitelmaStore" class="info-box"/>
        <ops-muokkaamattomat-osiot :opetussuunnitelmanTekstikappale="store.sisalto" class="info-box"/>
        <oppiaineet-statistiikka :opetussuunnitelmaStore="opetussuunnitelmaStore" class="info-box" />
      </div>
      <div class="col">
        <ops-viimeaikainen-toiminta :muokkaustietoStore="muokkaustietoStore" class="info-box"/>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <ops-aikataulu :ops="ops" :aikatauluStore="aikatauluStore" class="info-box" v-if="!isPohja"/>
      </div>
    </div>

  </div>
</template>

<script lang="ts">

import EpOpsRoute from '@/mixins/EpOpsRoute';
import { Component, Prop } from 'vue-property-decorator';
import OpsPerustiedot from './OpsPerustiedot.vue';
import OppiaineetStatistiikka from './OppiaineetStatistiikka.vue';
import OpsMuokkaamattomatOsiot from './OpsMuokkaamattomatOsiot.vue';
import OpsViimeaikainenToiminta from './OpsViimeaikainenToiminta.vue';
import OpsAikataulu from './OpsAikataulu.vue';
import { MuokkaustietoStore } from '@/stores/muokkaustieto';
import { AikatauluStore } from '@/stores/aikataulu';
import EpOpsUpdateConfirmBox from './EpOpsUpdateConfirmBox.vue';

@Component({
  components: {
    OpsPerustiedot,
    OppiaineetStatistiikka,
    OpsMuokkaamattomatOsiot,
    OpsViimeaikainenToiminta,
    OpsAikataulu,
    EpOpsUpdateConfirmBox,
  },
})
export default class RouteHallintapaneeli extends EpOpsRoute {
  @Prop({ required: true })
  private muokkaustietoStore!: MuokkaustietoStore;

  @Prop({ required: true })
  private aikatauluStore!: AikatauluStore;

  get perustepaivitys() {
    return !this.ops.perusteDataTuontiPvm;
  }

  async importPerusteTekstit() {
    await this.store.importPerusteTekstit();
  }

  async synkronisoiPohja() {
    await this.store.synkronisoiPohja();
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .hallintapaneeli {

    height: 100%;
    background-color: $gray-lighten-5;
    padding: 10px;

    .row {
      margin: 0px;
      padding-top: 10px;

      .col {
        padding: 0px;
        padding-left: 10px;
      }
    }

    .info-box {
      margin-bottom: 10px;
      padding:20px;
      background-color: #fff;
      border-radius: 0.5rem;
      box-shadow: 1px 1px 5px 0px rgba(0,26,88,0.1);
      min-width: 370px;
    }

    .syncBox {
      background-color: $white;
    }

    .importbox {
      background-color: $blue-lighten-4;
    }

  }

</style>
