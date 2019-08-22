<template lang="pug">

div
  ep-navigation(tyyli="ops")
  .opetussuunnitelma(v-if="ops")
    .header
      .progress-chart
        div
          ep-chart(
            labelColor="white",
            :chartColor="graph.colorScheme",
            :value="graph.value")
      .info
        h1
          span {{ $kaanna(ops.nimi) }}
          span.ml-2(v-if="isPohja") ({{ $t('pohja') }})
          b-dropdown.text-decoration-none(variant="link", no-caret)
            template(slot="button-content")
              fas.hallinta(icon="cog")
                span(class="sr-only") {{ $t('hallinta') }}
            b-dropdown-item
              router-link.btn.btn-link(:to=`{ name: 'opsTiedot' }`)
                fas.mr-2(icon="info-circle")
                span {{ $t('tiedot') }}
            b-dropdown-item
              router-link.btn.btn-link(:to=`{ name: 'opsDokumentti' }`)
                fas.mr-2(icon="file-pdf")
                span {{ $t('dokumentti') }}
            b-dropdown-item
              router-link.btn.btn-link(:to=`{ name: 'opsPoistetut' }`)
                fas.mr-2(icon="recycle")
                span {{ $t('poistetut') }}
            b-dropdown-item
              router-link.btn.btn-link(:to=`{ name: 'opsKasitteet' }`)
                fas.mr-2(icon="bookmark")
                span {{ $t('kasitteet') }}
            b-dropdown-item
              router-link.btn.btn-link(:to=`{ name: 'opsRakenne' }`)
                fas.mr-2(icon="cog")
                span {{ $t('rakenne') }}
            b-dropdown-item
              router-link.btn.btn-link(:to=`{ name: 'opsJulkaisu' }`)
                fas.mr-2(icon="upload")
                span {{ $t('julkaise') }}
          // b-badgeOpetushallitus.ml-2(style="font-size: 14px", variant="success", v-if="isValmisPohja")
            | {{ $t('julkinen') }}

        h4.secondary {{ $t(ops.koulutustyyppi) }}
        h6.secondary {{ ops.perusteenDiaarinumero }}

    .lower
      ep-sidebar
        template(slot="bar")
          ops-sidenav
        template(slot="view")
          transition(name="fade" mode="out-in")
            // ep-comment-threads
            router-view(:key="$route.fullPath")
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import {
  EpChart,
  EpNavigation,
  EpSidebar,
  EpSpinner,
  EpCommentThreads,
  OpsSidenav,
} from '@/components';


@Component({
  components: {
    EpChart,
    EpNavigation,
    EpCommentThreads,
    EpSidebar,
    EpSpinner,
    OpsSidenav,
  },
})
export default class RouteOpetussuunnitelma extends Mixins(EpOpsRoute) {
  get graph() {
    return {
      colorScheme: 'vihrea_sininen',
      value: Opetussuunnitelma.progress,
    };
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
    background-image: url('../../../public/img/banners/header.svg');
    background-position: 100% -64px;
    background-repeat: no-repeat;

    display: flex;
    align-items: center;
    color: $color-ops-header-text;

    .progress-chart {
      width: $sidebar-width;
      height: 150px;

      @media only screen and (max-width: 1024px) {
        display: none;
      }
    }

    .progress-chart > div {
      width: 130px;
      margin: 0 auto;
    }

    .info {
      @media only screen and (max-width: 768px) {
        padding-left: 30px;
      }

    }
  }

}

</style>
