<template>
  <div class="poistetut">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">{{ $t('poistetut') }}</h2>
    </div>
    <div class="sisalto">
      <b-tabs content-class="mt-4" v-model="tabIndex">
        <b-tab :title="$t('opintojaksot')">
          <ep-spinner v-if="isLoading" />
          <poistetut-haku-table v-else
                                :poistetut="opintojaksot"
                                @palauta="palauta" />
        </b-tab>
        <b-tab :title="$t('oppiaineet')">
          <ep-spinner v-if="isLoading" />
          <poistetut-haku-table v-else :poistetut="oppiaineet" @palauta="palauta" />
        </b-tab>
        <b-tab :title="$t('tekstikappaleet')">
          <ep-spinner v-if="isLoading" />
          <poistetut-haku-table v-else
                                :poistetut="tekstikappaleet"
                                @palauta="palauta" />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Lops2019PoistettuDto, PoistettuTekstiKappaleDto } from '@shared/api/ylops';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import Multiselect from 'vue-multiselect';
import PoistetutHakuTable from './poistetut/PoistetutHakuTable.vue';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorIndicator,
    EpContent,
    EpEditointi,
    EpFormContent,
    EpInput,
    EpMultiSelect,
    EpOppiaineSelector,
    EpPrefixList,
    EpSpinner,
    Multiselect,
    PoistetutHakuTable,
  },
})
export default class RouteOpintojakso extends Mixins(EpOpsRoute) {
  private poistetut: Lops2019PoistettuDto[] = [];
  private poistetutTekstikappaleet: PoistettuTekstiKappaleDto[] = [];
  private tabIndex = 0;

  async init() {
    // Ohjataan oikeaan tabiin
    const route = (this as any).$route;
    if (route && route.params && route.params.tabIndex) {
      this.tabIndex = _.parseInt(route.params.tabIndex);
    }
    await this.fetchPoistetut();
  }

  get oppiaineet() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'lops2019oppiaine');
  }

  get tekstikappaleet() {
    return this.poistetutTekstikappaleet;
  }

  get opintojaksot() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'opintojakso');
  }

  async fetchPoistetut() {
    const res = await Promise.all([
      this.store.getPoistetut(),
      this.store.getPoistetutTekstikappaleet(),
    ]);
    [this.poistetut, this.poistetutTekstikappaleet] = res;
  }

  async palauta(poistettu: any) {
    await this.store.palauta(poistettu);
    await this.fetchPoistetut();
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.poistetut {

  /deep/ .tabs .nav-item a {
    margin: 0;
    padding: 10px;
  }

  .ylapaneeli {
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    border-bottom: 1px solid #eee;
    height: 50px;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    padding: 15px;
  }
}

</style>
