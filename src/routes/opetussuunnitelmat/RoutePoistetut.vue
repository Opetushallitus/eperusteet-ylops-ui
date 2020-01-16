<template>
  <div class="poistetut">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">{{ $t('poistetut') }}</h2>
    </div>
    <div class="sisalto">
      <b-tabs content-class="mt-3" v-model="tabIndex">
        <b-tab :title="$t('opintojaksot')">
          <poistetut-haku-table :poistetut="opintojaksot" @palauta="palauta" />
        </b-tab>
        <b-tab :title="$t('oppiaineet')">
          <poistetut-haku-table :poistetut="oppiaineet" @palauta="palauta" />
        </b-tab>
        <b-tab :title="$t('tekstikappaleet')">
          <poistetut-haku-table :poistetut="tekstikappaleet" @palauta="palauta" />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMultiSelect from '@/components/forms/EpMultiSelect.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Lops2019PoistettuDto } from '@/tyypit';
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
  private tabIndex = 0;

  async init() {
    this.poistetut = await this.store.getPoistetut();

    // Ohjataan oikeaan tabiin
    const route = (this as any).$route;
    if (route && route.params && route.params.tabIndex) {
      this.tabIndex = _.parseInt(route.params.tabIndex);
    }
  }

  get oppiaineet() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'lops2019oppiaine');
  }

  get tekstikappaleet() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'tekstikappale');
  }

  get opintojaksot() {
    return _.filter(this.poistetut, p => p.tyyppi as string === 'opintojakso');
  }

  async palauta(poistettu: Lops2019PoistettuDto) {
    await this.store.palauta(poistettu);
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
