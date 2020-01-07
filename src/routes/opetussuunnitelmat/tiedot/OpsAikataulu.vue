<template>
  <div class="content">
    <h3>{{$t('aikataulu')}}</h3>

    <div class="pohja">
      <div class="kulunut-aika">&nbsp;</div>

      <div class="aikataulu d-inline-block">&nbsp;</div>
      <div class="aikataulu d-inline-block" style="left: 50%;">&nbsp;</div>

    </div>

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import _ from 'lodash';
import { OpetussuunnitelmaKevytDto, Lops2019OppiaineDto } from '@/tyypit';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { PerusteCache } from '@/stores/peruste';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components:{
    EpSpinner,
  }
})
export default class OpsAikataulu extends Vue {

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .pohja {
    margin: 20px;
    background-color: $gray-lighten-3;
    border-radius: 15px;
    height: 15px;

    .kulunut-aika {
      background-color: $green;
      border-radius: 15px;
      height: 15px;
    }

    .aikataulu {
      height: 15px;
      width: 15px;
      border-radius: 30px;
      background-color: $blue;
      position: relative;
    }

  }

</style>
