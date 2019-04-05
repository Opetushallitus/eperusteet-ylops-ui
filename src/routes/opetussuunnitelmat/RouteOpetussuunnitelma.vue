<template lang="pug">

div
  ep-navigation(tyyli="ops")
  .opetussuunnitelma(v-if="ops")
    .header
      .progress
        div
          ep-chart(
            labelColor="white",
            :chartColor="graph.colorScheme",
            :value="graph.value")
      .info
        h1 {{ $kaanna(ops.nimi) }}
        h4.secondary {{ $t(ops.koulutustyyppi) }}
        h6.secondary {{ ops.perusteenDiaarinumero }}

    .lower
      ep-sidebar
        template(slot="bar")
          ops-sidenav
        template(slot="view")
          transition(name="fade" mode="out-in")
            router-view(:key="$route.fullPath")
</template>

<script lang="ts">
import EpRoute from '@/mixins/EpRoot';
import Tilanvaihto from './Tilanvaihto.vue';
import _ from 'lodash';
import { DiagrammiVarit } from '@/tyypit';
import { Mixins, Component } from 'vue-property-decorator';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import {
  EpChart,
  EpNavigation,
  EpSidebar,
  EpSpinner,
  OpsSidenav,
} from '@/components';

@Component({
  components: {
    EpChart,
    EpNavigation,
    EpSidebar,
    EpSpinner,
    OpsSidenav,
    Tilanvaihto,
  },
})
export default class RouteOpetussuunnitelma extends Mixins(EpRoute) {
  get graph() {
    return {
      colorScheme: 'vihrea_sininen',
      value: 80,
    };
  }

  private get ops() {
    return Opetussuunnitelma.opetussuunnitelma;
  }

  protected async init() {
    const id = this.$route.params.id;
    await Opetussuunnitelma.init(_.parseInt(id));
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.fade-enter-active, .fade-leave-active {
  transition: opacity .1s;
}

.fade-enter, .fade-leave-to {
  transition: opacity .2s;
  opacity: 0;
}

.opetussuunnitelma {
  background: white;

  .header {
    background: $color-ops-header;
    display: flex;
    flex: stretch;
    align-items: center;

    * {
      background: $color-ops-header;
      color: $color-ops-header-text;
    }

    .progress {
      width: $sidebar-width;
      height: 150px;

      @media only screen and (max-width: 1024px) {
        display: none;
      }
    }

    .progress > div {
      width: 150px;
      margin: 0 auto;
    }

    .info {
      .secondary {
        color: #bbb;
      }

      @media only screen and (max-width: 768px) {
        padding-left: 30px;
      }

    }
  }

}

</style>
