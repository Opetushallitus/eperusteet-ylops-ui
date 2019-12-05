<template>
  <div class="poistetut">
    <div class="ylapaneeli">
      <h2 class="otsikko">{{ $t('poistetut') }}</h2>
    </div>
    <div class="sisalto">
      <div class="d-flex mb-3">
        <ep-search v-model="query"></ep-search>
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
import { Mixins, Component } from 'vue-property-decorator';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpColorBall from '@/components/EpColorBall/EpColorBall.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpSearch from '@/components/forms/EpSearch.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpInput from '@/components/forms/EpInput.vue';
import EpMultiSelect from '@/components/forms/EpMultiSelect.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Lops2019PoistettuDto } from '@/tyypit';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import Multiselect from 'vue-multiselect';
import PoistetutTable from './PoistetutTable.vue';


@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorBall,
    EpContent,
    EpEditointi,
    EpSearch,
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
    this.poistetut = await this.store.getPoistetut();
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
    await this.store.palauta(poistettu);
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
  }
}

</style>
