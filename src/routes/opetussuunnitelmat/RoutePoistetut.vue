<template lang="pug">
.poistetut
  .ylapaneeli
    div.otsikko {{ $t('poistetut') }}

  table.table.table-striped
    thead
      tr
        th {{ $t('nimi') }}
        th {{ $t('poistoajankohta') }}
        th {{ $t('poistaja') }}
        th {{ $t('toiminnot') }}
    tbody
      tr(v-for="poistettu in poistetut")
        td {{ $kaanna(poistettu.nimi) }}
        td {{ $ago(poistettu.luotu) }}
        td {{ poistettu.luoja }}
        td 
          ep-button.btn-sm(@click="palauta(poistettu)") {{ $t('palauta') }}


</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import {
  EpButton,
  EpCollapse,
  EpColorBall,
  EpContent,
  EpEditointi,
  EpField,
  EpFormContent,
  EpInput,
  EpMultiSelect,
  EpOppiaineSelector,
  EpPrefixList,
  EpSpinner,
} from '@/components';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto } from '@/tyypit';
import { Opintojaksot } from '@/api';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { PerusteCache } from '@/stores/peruste';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import _ from 'lodash';
import { opintojaksoValidator } from '@/validators/opintojakso';
import { Kielet } from '@/stores/kieli';
import Multiselect from 'vue-multiselect';
import * as defaults from '@/defaults';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorBall,
    EpContent,
    EpEditointi,
    EpField,
    EpFormContent,
    EpInput,
    EpMultiSelect,
    EpOppiaineSelector,
    EpPrefixList,
    EpSpinner,
    Multiselect,
  },
})
export default class RouteOpintojakso extends Mixins(EpOpsRoute) {
  private poistetut: any[] = [];

  async init() {
    this.poistetut = await Opetussuunnitelma.getPoistetutOpintojaksot();
  }

  async palauta(poistettu: any) {
    const oj = await Opetussuunnitelma.palautaOpintojakso(poistettu.id);
    this.$router.push({
      name: 'opintojakso',
      params: {
        ...this.$router.currentRoute.params,
        opintojaksoId: '' + oj.id,
      },
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables.scss";

.poistetut {
  margin-top: 4px;

  .ylapaneeli {
    font-size: 90%;
    font-weight: 600;
    padding: 8px 5px;

    .otsikko {
      font-size: 150%;
    }
  }

  .sisalto {
    padding: 10px;
  }
}


</style>
