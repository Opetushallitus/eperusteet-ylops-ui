<template>
  <div class="hallintapaneeli">

    <div class="row">
      <div class="col">
        <ops-perustiedot :ops="ops" class="info-box" />
        <ops-muokkaamattomat-osiot :opetussuunnitelmanTekstikappale="store.sisalto" class="info-box"/>
        <oppiaineet-statistiikka :opetussuunnitelmaStore="opetussuunnitelmaStore" class="info-box" />
      </div>
      <div class="col">
        <ops-viimeaikainen-toiminta :ops="ops" class="info-box"/>
      </div>
    </div>

    <!-- <div class="row">
      <div class="col">
        <ops-aikataulu class="info-box"/>
      </div>
    </div> -->

  </div>
</template>

<script lang="ts">

import EpOpsRoute from '@/mixins/EpOpsRoute';
import { Component } from 'vue-property-decorator';
import OpsPerustiedot from './OpsPerustiedot.vue';
import { OpetussuunnitelmaKevytDto } from '@/tyypit';
import OppiaineetStatistiikka from './OppiaineetStatistiikka.vue';
import OpsMuokkaamattomatOsiot from './OpsMuokkaamattomatOsiot.vue';
import OpsViimeaikainenToiminta from './OpsViimeaikainenToiminta.vue';
import OpsAikataulu from './OpsAikataulu.vue';
import _ from 'lodash';
import { PerusteCache } from '@/stores/peruste';
import { TekstiKappaleViiteKevytDto } from '@/tyypit';

@Component({
  components: {
    OpsPerustiedot,
    OppiaineetStatistiikka,
    OpsMuokkaamattomatOsiot,
    OpsViimeaikainenToiminta,
    OpsAikataulu,
  }
})
export default class RouteHallintapaneeli extends EpOpsRoute {

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

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

  }

</style>
