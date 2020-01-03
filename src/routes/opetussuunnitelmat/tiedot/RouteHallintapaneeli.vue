<template>
  <div class="hallintapaneeli">

      <ops-perustiedot :ops="ops" class="info-box w-50" />

  </div>
</template>

<script lang="ts">

import EpOpsRoute from '@/mixins/EpOpsRoute';
import { Component } from 'vue-property-decorator';
import OpsPerustiedot from './OpsPerustiedot.vue';
import { OpetussuunnitelmaKevytDto } from '@/tyypit';

@Component({
  components: {
    OpsPerustiedot,
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


    .info-box {
      padding:20px;
      background-color: #fff;
      border-radius: 0.5rem;
      box-shadow: 1px 1px 5px 0px rgba(0,26,88,0.1);
    }

  }

</style>
