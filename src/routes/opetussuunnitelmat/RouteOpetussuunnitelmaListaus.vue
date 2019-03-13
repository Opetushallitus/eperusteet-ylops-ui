<template lang="pug">
div
  ep-navigation(tyyli="ops")
  .opetussuunnitelma
    .header
    .content
      router-link(
        tag="button"
        v-for="ops in opslista"
        class="opskomponentti"
        :to=`{ name: "opetussuunnitelma", params: { id: ops.id } }`
        :key="ops.id")
        div.chart
          ep-chart(:value="80"
            labelColor="white"
            chartColor="DiagrammiVarit.vihrea_sininen")
        div.nimi
          ep-content(:value="ops.nimi")
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';

import EpRoute from '@/mixins/EpRoot';
import { Opetussuunnitelmat } from '@/api';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';
import { DiagrammiVarit } from '@/tyypit';

import {
  EpChart,
  EpContent,
  EpNavigation,
  EpSpinner,
} from '@/components';

@Component({
  components: {
    EpChart,
    EpContent,
    EpNavigation,
    EpSpinner,
  },
})
export default class RouteOpetussuunnitelmaListaus extends Mixins(EpRoute) {

  private opslista: OpetussuunnitelmaInfoDto[] = [];

  protected async init() {
    const res = await Opetussuunnitelmat.getAll();
    this.opslista = res.data;
  }

}
</script>

<style lang="scss" scoped>
$box-size: 350px;

.content {
  text-align: center;
}

.opskomponentti {
  background: url('/img/banners/laatikoiden_tausta.svg');
  background-size: contain;
  border-radius: 20px;
  width: $box-size*0.85;
  height: $box-size;
  text-align: center;
  padding: 20px 10px 0px 10px;
  display: inline-block;
  margin-right: 50px;
  outline: 0;

  .chart {
    width: 60%;
    margin: 0 auto;
  }

  .nimi {
    margin-top: 20px;
    font-size: 17pt;
    color: white;
    hyphens: none;
  }
}
</style>
