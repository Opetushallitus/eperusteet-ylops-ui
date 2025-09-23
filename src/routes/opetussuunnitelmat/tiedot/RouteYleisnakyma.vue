<template>
  <div class="hallintapaneeli">

    <template v-if="!isPohja">
      <div v-if="pohjallaPuuttuviaTeksteja === null" class="d-flex justify-content-center">
        {{$t('tarkistetaan-pohjan-tekstimuutokset')}}
        <EpSpinner />
      </div>
      <div class="info-box import-box"
        v-if="pohjallaPuuttuviaTeksteja"
        v-oikeustarkastelu="oikeustarkastelu">
        <template v-if="pohjanaOphPohja || viimeisinPohjaTekstiSyncVirheellinen">
          <h2>{{$t('paivita-opetussuunnitelman-tekstirakenne')}}</h2>
          <div v-html="$t('paivita-opetussuunnitelma-perustetekstikappaleet-pohjasta-huomioteksti')" />
        </template>
        <template v-else>
          <h2>{{$t('paivita-opetussuunnitelman-tekstirakenne-koulun-ops')}}</h2>
          <div v-html="$t('paivita-opetussuunnitelma-perustetekstikappaleet-pohjasta-huomioteksti-koulun-ops')" />
        </template>
        <br/>
        <div>{{$t('paivita-opetussuunnitelma-perustetekstikappaleet-pohjasta-peruste-selvennys')}}</div>
        <EpExternalLink :url="perusteUrl">{{$kaanna(perusteNimi)}}</EpExternalLink>

        <div class="d-flex justify-content-end">
          <div class="d-flex align-items-end mr-3 disabled-text font-size-08" v-if="viimeisinPohjaTekstiSync">
            {{$t('viimeisin-synkronisointi-pvm')}} {{$sd(viimeisinPohjaTekstiSync)}}
          </div>
          <ep-button @click="syncTekstitPohjasta()" :showSpinner="syncPohja" v-if="pohjanaOphPohja || viimeisinPohjaTekstiSyncVirheellinen">
            {{$t('paivita-opetussuunnitelma')}}
          </ep-button>
        </div>
      </div>
    </template>

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
        <ops-perustiedot :opetussuunnitelmaStore="props.opetussuunnitelmaStore" class="info-box"/>
        <ops-muokkaamattomat-osiot :opetussuunnitelmanTekstikappale="store.sisalto" class="info-box"/>
        <oppiaineet-statistiikka v-if="!yksinkertainen" :opetussuunnitelmaStore="props.opetussuunnitelmaStore" class="info-box" />
      </div>
      <div class="col">
        <ops-viimeaikainen-toiminta :ops="ops" :muokkaustietoStore="props.muokkaustietoStore" class="info-box"/>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <ops-aikataulu :ops="ops" :aikatauluStore="props.aikatauluStore" class="info-box" v-if="!isPohja"/>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import _ from 'lodash';
import OpsPerustiedot from './OpsPerustiedot.vue';
import OppiaineetStatistiikka from './OppiaineetStatistiikka.vue';
import OpsMuokkaamattomatOsiot from './OpsMuokkaamattomatOsiot.vue';
import OpsViimeaikainenToiminta from './OpsViimeaikainenToiminta.vue';
import OpsAikataulu from './OpsAikataulu.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import { useEpOpsRoute } from '@/mixins/EpOpsRoute';
import { MuokkaustietoStore } from '@/stores/muokkaustieto';
import { AikatauluStore } from '@/stores/aikataulu';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { createLogger } from '@shared/utils/logger';
import { KoulutustyyppiToteutus } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { buildKatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import { MuokkaustietoKayttajallaDtoTapahtumaEnum } from '@shared/api/ylops';
import { $success, $fail, $t } from '@shared/utils/globals';

const props = defineProps<{
  muokkaustietoStore: MuokkaustietoStore;
  aikatauluStore: AikatauluStore;
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const { store, ops, isPohja } = useEpOpsRoute(props.opetussuunnitelmaStore);

const importing = ref(false);
const syncing = ref(false);
const syncPohja = ref(false);

const perustepaivitys = computed(() => {
  return !ops.value.perusteDataTuontiPvm;
});

const syncTekstitPohjasta = async () => {
  syncPohja.value = true;
  try {
    await store.value.syncTekstitPohjasta();
    await props.muokkaustietoStore.init();
    await store.value.init();
    $success($t('muutokset-paivitetty-opetussuunnitelmaan') as string);
  }
  catch (e) {
    $fail($t('muutokset-paivitetty-opetussuunnitelmaan-virhe') as string);
    createLogger('RouteYleisnakyma').error(e);
  }
  syncPohja.value = false;
};

const synkronisoiPohja = async () => {
  syncing.value = true;
  try {
    await store.value.synkronisoiPohja();
    $success($t('muutokset-paivitetty-opetussuunnitelmiin') as string);
    await store.value.init();
  }
  catch (e) {
    $fail($t('muutokset-paivitetty-opetussuunnitelmiin-virhe') as string);
    createLogger('RouteYleisnakyma').error(e);
  }
  syncing.value = false;
};

const yksinkertainen = computed(() => {
  return (ops.value?.toteutus as any) === KoulutustyyppiToteutus.yksinkertainen;
});

const pohjallaPuuttuviaTeksteja = computed(() => {
  return store.value.pohjallaPuuttuviaTeksteja;
});

const viimeisinPohjaTekstiSync = computed(() => {
  return store.value.viimeisinPohjaTekstiSync?.luotu || ops.value.perusteDataTuontiPvm || ops.value.luotu;
});

const pohjanPerustePaivittynyt = computed(() => {
  return store.value.pohjanPerustePaivittynyt;
});

const isLops2019 = computed(() => {
  return ((ops.value.toteutus as any) === KoulutustyyppiToteutus.lops2019);
});

const oikeustarkastelu = computed(() => {
  return { oikeus: 'hallinta', kohde: isPohja.value ? 'pohja' : 'opetussuunnitelma' };
});

const perusteId = computed(() => {
  return ops.value?.perusteenId;
});

const perusteUrl = computed(() => {
  return buildKatseluUrl(Kielet.getSisaltoKieli.value, `/${koulutustyyppiTheme(ops.value.koulutustyyppi!)}/${perusteId.value}/muutoshistoria?noscroll`);
});

const perusteNimi = computed(() => {
  return store.value.peruste?.nimi;
});

const pohjanaOphPohja = computed(() => {
  return _.toLower(ops.value.pohja?.tyyppi) === 'pohja';
});

const viimeisinPohjaTekstiSyncVirheellinen = computed(() => {
  return store.value.viimeisinPohjaTekstiSync?.tapahtuma === _.toLower(MuokkaustietoKayttajallaDtoTapahtumaEnum.VIRHE)
    || (store.value.pohjaOpetussuunnitelmaViimeisinPohjaTekstiSync !== null && aikaMyohemminKuin(store.value.pohjaOpetussuunnitelmaViimeisinPohjaTekstiSync?.luotu as any, 4));
});

const aikaMyohemminKuin = (timeInMillis: number, tuntia: number) => {
  return timeInMillis < new Date().getTime() - tuntia * 60 * 60 * 1000;
};
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
