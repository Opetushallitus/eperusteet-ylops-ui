<template>
  <div class="poistetut">
    <div class="ylapaneeli">
      <h2 class="otsikko">{{ $t('poistetut') }}</h2>
    </div>
    <div class="sisalto">
      <div class="haku">
        <b-row>
          <b-col>
            <ep-filter v-model="query" />
          </b-col>
          <b-col></b-col>
          <b-col></b-col>
        </b-row>
      </div>
      <b-tabs content-class="mt-3">
        <b-tab :title="$t('opintojaksot')">
          <poistetut-table :poistetut="opintojaksot" @palauta="palauta" />
        </b-tab>
        <b-tab :title="$t('oppiaineet')">
          <poistetut-table :poistetut="oppiaineet" @palauta="palauta" />
        </b-tab>
        <b-tab :title="$t('tekstikappaleet')">
          <poistetut-table :poistetut="tekstikappaleet" @palauta="palauta" />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import {
  EpButton,
  EpCollapse,
  EpColorBall,
  EpContent,
  EpEditointi,
  EpFilter,
  EpFormContent,
  EpInput,
  EpMultiSelect,
  EpOppiaineSelector,
  EpPrefixList,
  EpSpinner,
} from '@/components';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019PoistettuDto, Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto } from '@/tyypit';
import { Opintojaksot } from '@/api';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { PerusteCache } from '@/stores/peruste';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import _ from 'lodash';
import { opintojaksoValidator } from '@/validators/opintojakso';
import { Kielet } from '@/stores/kieli';
import Multiselect from 'vue-multiselect';
import * as defaults from '@/defaults';
import PoistetutTable from './PoistetutTable.vue';


@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorBall,
    EpContent,
    EpEditointi,
    EpFilter,
    EpFormContent,
    EpInput,
    EpMultiSelect,
    EpOppiaineSelector,
    EpPrefixList,
    EpSpinner,
    Multiselect,
    PoistetutTable,
  },
})
export default class RouteOpintojakso extends Mixins(EpOpsRoute) {
  private poistetut: Lops2019PoistettuDto[] = [];
  private query = '';

  async init() {
    this.poistetut = await Opetussuunnitelma.getPoistetut();
  }

  get rajaus() {
    return _.chain(this.poistetut)
      .filter((p) =>
        Kielet.search(this.query, p.nimi)
        || Kielet.search(this.query, p.parent))
      .sortBy('luotu')
      .value();
  }

  get oppiaineet() {
    return _.filter(this.rajaus, p => p.tyyppi as string === 'lops2019oppiaine');
  }

  get tekstikappaleet() {
    return _.filter(this.rajaus, p => p.tyyppi as string === 'tekstikappale');
  }

  get opintojaksot() {
    return _.filter(this.rajaus, p => p.tyyppi as string === 'opintojakso');
  }

  async palauta(poistettu: Lops2019PoistettuDto) {
    await Opetussuunnitelma.palauta(poistettu);
    // this.$router.push({
    //   name: 'opintojakso',
    //   params: {
    //     ...this.$router.currentRoute.params,
    //     opintojaksoId: '' + poistettu.poistettu_id,
    //   },
    // });
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables.scss";

.poistetut {

  .ylapaneeli {
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    border-bottom: 1px solid #eee;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    padding: 15px;

    .haku {
      padding: 0 0 15px 0;
    }
  }
}

</style>
