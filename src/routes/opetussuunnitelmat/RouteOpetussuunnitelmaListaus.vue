<template lang="pug">
div
  ep-main-view
    template(slot="icon")
      ep-icon.float-right(icon="opetussuunnitelmasi", background-color="#5bca13")

    template(slot="header")
      h2 {{ $t(tyyppi) }}
      p {{ $t(tyyppi + '-kuvaus') }}

    .info(v-if="opslista.length === 0")
      span {{ $t('opetussuunnitelmia-ei-ole-luotu') }}

    .opscontainer
      .opswrapper(v-for="ops in opslista")
        .opsbox
          div.chart
            ep-chart(:value="80"
              labelColor="white"
              chartColor="vihrea_sininen")
          router-link.nimi(
            :to=`{ name: "opsTiedot", params: { id: ops.id } }`,
            :key="ops.id")
            | {{ $kaanna(ops.nimi) }}

</template>

<script lang="ts">
import { Vue, Prop, Component, Mixins } from 'vue-property-decorator';

import EpRoute from '@/mixins/EpRoot';
import { Opetussuunnitelmat } from '@/api';
import { OpetussuunnitelmaInfoDto } from '@/tyypit';

import {
  EpChart,
  EpContent,
  EpIcon,
  EpMainView,
  EpNavigation,
  EpSpinner,
} from '@/components';

@Component({
  components: {
    EpChart,
    EpContent,
    EpIcon,
    EpMainView,
    EpNavigation,
    EpSpinner,
  },
})
export default class RouteOpetussuunnitelmaListaus extends Mixins(EpRoute) {
  @Prop({ default: 'opetussuunnitelmat' })
  private tyyppi!: 'opetussuunnitelmat' | 'pohjat';

  private opslista: OpetussuunnitelmaInfoDto[] = [];

  protected async init() {
    const res = await Opetussuunnitelmat.getAll(this.tyyppi === 'pohjat' ? 'POHJA' : 'OPS');
    this.opslista = res.data;
  }
}
</script>

<style lang="scss" scoped>
$box-size: 350px;

.opscontainer {
  display: flex;
  flex-wrap: wrap;

  .opswrapper {
    .opsbox {
      margin: 20px;
      width: $box-size * 0.85;
      height: $box-size;
      background: url('../../../public/img/banners/laatikoiden_tausta.svg');
      background-size: contain;

      border-radius: 20px;
      width: $box-size * 0.85;
      height: $box-size;
      text-align: center;
      padding: 0px 10px;
      display: inline-block;
      margin-right: 50px;
      outline: 0;
      border: 0;

      .chart {
        width: 60%;
        height: 55%;
        padding-top: 10px;
        margin: 0 auto;
      }

      .nimi {
        padding-top: 20px;
        font-size: 17pt;
        color: white;
        hyphens: none;
      }
  }

  }
}

</style>
