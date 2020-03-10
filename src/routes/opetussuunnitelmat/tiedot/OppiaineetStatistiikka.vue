<template>
  <div class="content">
    <h3>{{$t('oppiaineet')}}</h3>

    <ep-spinner v-if="!cache"></ep-spinner>
    <div v-else>

      <div class="box d-inline-flex align-items-center flex-column">
        <div class="count">{{luodutOpintojaksot}}</div>
        <div class="topic text-center">{{ $t('luotuja-opintojaksoja') }}</div>
      </div>

      <div class="box d-inline-flex align-items-center flex-column">
        <div class="count">
          <span>{{liitetytModuulitLukumaara}}</span>
          <span class="secondary">/ {{moduulitLukumaara}}</span>
        </div>
        <div class="topic text-center">{{ $t('moduulia-liitetty') }}</div>
      </div>

      <div class="box d-inline-flex align-items-center flex-column">
        <div class="count">{{useanOppiaineenOpintojaksot}}</div>
        <div class="topic text-center">{{$t('usean-oppiaineen-opintojaksoa')}}</div>
      </div>

      <div class="box d-inline-flex align-items-center flex-column">
        <div class="count">{{paikallisetOppiaineet}}</div>
        <div class="topic text-center">{{$t('paikallista-oppiainetta')}}</div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';
import _ from 'lodash';
import { OpetussuunnitelmaKevytDto, Lops2019OppiaineDto } from '@shared/api/ylops';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { PerusteCache } from '@/stores/peruste';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components:{
    EpSpinner,
  }
})
export default class OppiaineetStatistiikka extends Mixins(EpOpsComponent) {

  private cache: PerusteCache | null = null;

  async mounted() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
  }

  get perusteCache() {
    return this.cache;
  }

  get luodutOpintojaksot() {
    return _.size(this.store.opintojaksot);
  }

  get liitetytModuulitLukumaara() {
    return _.size(
      _.filter(this.moduulit, (moduuli) => _.includes(this.opintojaksojenModuuliKoodiUri, moduuli.koodi!.uri))
    );
  }

  get opintojaksojenModuuliKoodiUri() {
    return _.chain(this.store.opintojaksot)
      .map((oa) => _.map(oa.moduulit, (moduuli) => moduuli.koodiUri))
      .flatten()
      .value();
  }

  get moduulit() {
    return _.chain(this.oppiaineet)
      .map((oa) => _.map(oa.moduulit, (moduuli) => ({
        ...moduuli
      })))
      .flatten()
      .value();
  }

  get moduulitLukumaara() {
    return _.size(this.moduulit);
  }

  get useanOppiaineenOpintojaksot() {
    return _.size(_.filter(this.store.opintojaksot, (opintojakso) => _.size(opintojakso.oppiaineet) > 1));
  }

  get paikallisetOppiaineet() {
    return _.size(this.store.paikallisetOppiaineet);
  }

  get oppiaineet() {
    if (this.cache) {
      return [
        ...this.cache.peruste.oppiaineet,
        ...this.store.paikallisetOppiaineet,
        ...this.perusteenOppiaineidenOppimaarat,
      ] as Lops2019OppiaineDto[];
    }
  }

  get perusteenOppiaineidenOppimaarat() {
    if (this.cache) {
      return _.chain(this.cache.peruste.oppiaineet)
        .map((oa) => _.map(oa.oppimaarat, (oppimaarat) => ({
          ...oppimaarat
        })))
        .flatten()
        .value();
    }
    else {
      return [];
    }
  }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .box {
    width: 125px;
    height: 140px;
    margin-right: 10px;
    margin-top: 10px;
    padding: 10px;
    background-color: #f7f8fc;

    .count {
      font-size: 2.375rem;
      line-height: 1;

      .secondary {
        font-size: 1rem;
        color: $gray-lighten-1;
      }
    }

    .topic {
      padding-top: 10px;
    }
  }


</style>
