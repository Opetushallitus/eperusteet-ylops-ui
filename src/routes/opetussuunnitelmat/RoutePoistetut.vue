<template>
  <div class="poistetut">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">{{ $t('poistetut') }}</h2>
    </div>
    <div class="sisalto">
      <b-tabs content-class="mt-4" v-model="tabIndex">
        <b-tab v-for="(tab, index) in tabs" :key="'tab'+index" :title="$t(tab.otsikko)">
          <ep-spinner v-if="isLoading" />
          <poistetut-haku-table v-else
                                :poistetut="tab.poistetut"
                                @palauta="palauta" />
        </b-tab>
      </b-tabs>

      <div v-if="!isLoading && tabs.length === 0">{{$t('ei-poistettuja-sisaltoja')}}</div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
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
import PoistetutHakuTable from '@shared/components/EpPoistettuTable/PoistetutHakuTable.vue';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorIndicator,
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
export default class RoutePoistetut extends Mixins(EpOpsRoute) {
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

  get tabs() {
    return _.filter([{
      otsikko: 'opintojakso',
      poistetut: this.opintojaksot,
    }, {
      otsikko: 'tuodut-opintojaksot',
      poistetut: this.tuodutOpintojaksot,
    }, {
      otsikko: 'oppiaine',
      poistetut: this.lops2019oppiaineet,
    }, {
      otsikko: 'oppiaine',
      poistetut: this.oppiaineet,
    }, {
      otsikko: 'tekstikappaleet',
      poistetut: this.tekstikappaleet,
    }, {
      otsikko: 'tuodut-oppimaarat',
      poistetut: this.tuodutOppimaarat,
    },
    ], tab => _.size(tab.poistetut) > 0);
  }

  get lops2019oppiaineet() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'lops2019oppiaine');
  }

  get oppiaineet() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'oppiaine');
  }

  get tekstikappaleet() {
    return this.poistetutTekstikappaleet;
  }

  get tuodutOpintojaksot() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'tuotu_opintojakso');
  }

  get opintojaksot() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'opintojakso');
  }

  get tuodutOppimaarat() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'tuotu_oppimaara');
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

  ::v-deep .tabs .nav-item a {
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
