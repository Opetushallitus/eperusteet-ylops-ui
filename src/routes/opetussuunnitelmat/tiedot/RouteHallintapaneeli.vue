<template>
  <div class="hallintapaneeli">

    <div
      class="info-box import-box"
      v-if="!isPohja && perustepaivitys"
      v-oikeustarkastelu="oikeustarkastelu">
      <h2>{{$t('paivita-opetussuunnitelma')}}</h2>
      <div v-html="$t('paivita-opetussuunnitelma-huomioteksti')" />

      <div class="d-flex justify-content-end">
        <ep-button variant="link" class="mr-4" @click="importPerusteTekstit(true)" :disabled="importing">
          {{$t('ohita')}}
        </ep-button>
        <ep-button @click="importPerusteTekstit(false)" :showSpinner="importing">
          {{$t('paivita-opetussuunnitelma')}}
        </ep-button>
      </div>
    </div>

    <!-- <div v-if="!isPohja && pohjallaPuuttuviaTeksteja === null" class="d-flex justify-content-center">
      {{$t('tarkistetaan-pohjan-tekstimuutokset')}}
      <EpSpinner />
    </div>
    <div
      class="info-box import-box"
      v-if="!isPohja && pohjallaPuuttuviaTeksteja"
      v-oikeustarkastelu="oikeustarkastelu">
      <h2>{{$t('paivita-opetussuunnitelman-tekstirakenne')}}</h2>
      <div v-html="$t('paivita-opetussuunnitelma-perustetekstikappaleet-pohjasta-huomioteksti')" />

      <div class="d-flex justify-content-end">
        <ep-button @click="syncTekstitPohjasta()" :showSpinner="syncPohja">
          {{$t('paivita-opetussuunnitelma')}}
        </ep-button>
      </div>
    </div> -->

    <template v-if="isPohja">
      <EpSpinner v-if="pohjanPerustePaivittynyt === null" />
      <div
        class="info-box sync-box"
        v-else-if="pohjanPerustePaivittynyt"
        v-oikeustarkastelu="oikeustarkastelu">
        <h2>{{$t('paivita-pohjan-peruste-opetussuunnitelmiin')}}</h2>
        <div v-html="$t('paivita-pohjan-peruste-opetussuunnitelmiin-huomioteksti')" />

        <div class="d-flex justify-content-end">
          <div class="d-flex align-items-end mr-3 disabled-text font-size-08" v-if="ops.viimeisinSyncPvm">
            {{$t('viimeisin-synkronisointi-pvm')}} {{$sdt(ops.viimeisinSyncPvm)}}
          </div>
          <ep-button @click="synkronisoiPohja" :showSpinner="syncing">
            {{$t('paivita-peruste')}}
          </ep-button>
        </div>
      </div>
    </template>

    <div class="row">
      <div class="col">
        <ops-perustiedot :opetussuunnitelmaStore="opetussuunnitelmaStore" class="info-box"/>
        <ops-muokkaamattomat-osiot :opetussuunnitelmanTekstikappale="store.sisalto" class="info-box"/>
        <oppiaineet-statistiikka v-if="!yksinkertainen" :opetussuunnitelmaStore="opetussuunnitelmaStore" class="info-box" />
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
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { createLogger } from '@shared/utils/logger';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { KoulutustyyppiToteutus } from '@shared/tyypit';

@Component({
  components: {
    OpsPerustiedot,
    OppiaineetStatistiikka,
    OpsMuokkaamattomatOsiot,
    OpsViimeaikainenToiminta,
    OpsAikataulu,
    EpButton,
    EpSpinner,
  },
})
export default class RouteHallintapaneeli extends EpOpsRoute {
  @Prop({ required: true })
  private muokkaustietoStore!: MuokkaustietoStore;

  @Prop({ required: true })
  private aikatauluStore!: AikatauluStore;

  private importing = false;
  private syncing = false;
  private syncPohja = false;

  get perustepaivitys() {
    return !this.ops.perusteDataTuontiPvm;
  }

  async importPerusteTekstit(ohita) {
    this.importing = true;
    try {
      await this.store.importPerusteTekstit(ohita);
      if (!ohita) {
        this.$success(this.$t('perusteen-tekstikappaleet-tuotu-opetussuunitelmaan') as string);
      }
      await this.store.init();
    }
    catch (e) {
      this.$fail(this.$t('perusteen-tekstikappaleet-tuotu-opetussuunitelmaan-virhe') as string);
      createLogger('RouteHallintapaneeli').error(e);
    }
    this.importing = false;
  }

  async syncTekstitPohjasta() {
    this.syncPohja = true;
    try {
      await this.store.syncTekstitPohjasta();
      this.$success(this.$t('muutokset-paivitetty-opetussuunnitelmaan') as string);
      await this.store.init();
    }
    catch (e) {
      this.$fail(this.$t('muutokset-paivitetty-opetussuunnitelmaan-virhe') as string);
      createLogger('RouteHallintapaneeli').error(e);
    }
    this.syncPohja = false;
  }

  async synkronisoiPohja() {
    this.syncing = true;
    try {
      await this.store.synkronisoiPohja();
      this.$success(this.$t('muutokset-paivitetty-opetussuunnitelmiin') as string);
      await this.store.init();
    }
    catch (e) {
      this.$fail(this.$t('muutokset-paivitetty-opetussuunnitelmiin-virhe') as string);
      createLogger('RouteHallintapaneeli').error(e);
    }
    this.syncing = false;
  }

  get yksinkertainen() {
    return (this.ops?.toteutus as any) === KoulutustyyppiToteutus.yksinkertainen;
  }

  get pohjallaPuuttuviaTeksteja() {
    return this.store.pohjallaPuuttuviaTeksteja;
  }

  get pohjanPerustePaivittynyt() {
    return this.store.pohjanPerustePaivittynyt;
  }

  get isLops2019() {
    return ((this.ops.toteutus as any) === KoulutustyyppiToteutus.lops2019);
  }

  get oikeustarkastelu() {
    return { oikeus: 'hallinta', kohde: this.isPohja ? 'pohja' : 'opetussuunnitelma' };
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

      &.sync-box {
        margin-left: 10px;
      }

      &.import-box {
        margin-left: 10px;
        background-color: $blue-lighten-4;
      }
    }

  }

</style>
