<template>
<div class="content">
  <ep-spinner v-if="isLoading">
  </ep-spinner>
  <div v-if="!isLoading && oppiaine">
    <h2>
      <span>{{ $kaanna(oppiaine.nimi) }}</span>
      <span class="ml-1" v-if="oppiaine.koodi">({{ oppiaine.koodi.arvo }})</span>
    </h2>
    <div class="collapse-container">
      <ep-collapse v-if="oppiaine.tehtava">
        <h3 slot="header">{{ isOppiaine ? $t('oppiaineet-tehtava') : $t('oppimaaran-tehtava')}}</h3>
        <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="oppiaine.tehtava.kuvaus"> </ep-content>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.laajaAlaisetOsaamiset">
        <h3 slot="header">{{ $t('laaja-alainen-osaaminen') }}</h3>
        <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="oppiaine.laajaAlaisetOsaamiset.kuvaus"> </ep-content>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.tavoitteet">
        <h3 slot="header">{{ $t('tavoitteet') }}</h3>
        <ep-content layout="normal" opetussuunnitelma-store="opetussuunnitelmaStore" v-model="oppiaine.tavoitteet.kuvaus"></ep-content>
        <ep-prefix-list :value="oppiaine.tavoitteet.tavoitealueet" kohde="kohde" arvot="tavoitteet"></ep-prefix-list>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.arviointi">
        <h3 slot="header">{{ $t('arviointi') }}</h3>
        <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="oppiaine.arviointi.kuvaus"></ep-content>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.oppimaarat && oppiaine.oppimaarat.length > 0">
        <h3 slot="header">{{ $t('oppimaarat') }}</h3>
        <div class="oppimaarat-topic">{{ $t('oppiaine-oppimaara-ohje')}}</div>
        <div class="block-container oppimaarat" v-for="oppimaara in oppiaine.oppimaarat" :key="oppimaara.id">
          <router-link class="om-content" :to="{ name: 'oppiaine', params: { oppiaineId: oppimaara.id } }">
            <span class="nimi">{{ $kaanna(oppimaara.nimi) }}</span>
          </router-link>
        </div>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.moduulit && oppiaine.moduulit.length > 0">
        <h3 slot="header">{{ $t('moduulit') }}</h3>
        <div class="oppimaarat-topic">{{ $t('oppiaine-moduuli-ohje')}}</div>
        <div class="block-container">
          <div class="moduulit">
            <div class="moduuli" v-for="moduuli in moduulit" :key="moduuli.koodiUri">
              <router-link :to="{ name: 'moduuli', params: { moduuliId: moduuli.id } }">
                <ep-opintojakson-moduuli :moduuli="moduuli">
                </ep-opintojakson-moduuli>
              </router-link>
            </div>
          </div>
        </div>
      </ep-collapse>
      <div v-if="!(isOppiaine && isOppimaaria)">
        <ep-spinner v-if="!opintojaksot">
        </ep-spinner>
        <ep-collapse else>
          <h3 slot="header">{{ $t('opintojaksot') }}</h3>
          <div v-if="opintojaksot.length === 0">
            <div class="alert alert-info">{{ $t('opintojaksoja-ei-lisatty') }}</div>
          </div>
          <div v-else>
            <div class="oppimaarat-topic">{{ $t('oppiaine-opintojakso-ohje')}}</div>
            <div class="block-container" v-for="opintojakso in opintojaksot" :key="opintojakso.id">
              <div class="oj-content pakollinen">
                <span class="nimi">
                  <router-link :to="{ name: 'opintojakso', params: { opintojaksoId: opintojakso.id } }">
                    {{ $kaanna(opintojakso.nimi) }}
                  </router-link>
                </span>
                <span class="pituus">{{ opintojakso.laajuus }} {{ $t('opintopiste') }}</span>
              </div>
            </div>
          </div>
          <ep-button icon="plussa" @click="uusiOpintojakso()">{{ $t('uusi-opintojakso') }}</ep-button>
        </ep-collapse>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import { Lops2019OppiaineDto } from '@shared/api/ylops';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { PerusteCache } from '@/stores/peruste';
import _ from 'lodash';
import EpOpintojaksonModuuli from '@/routes/opetussuunnitelmat/sisalto/oppiaineet/opintojaksot/EpOpintojaksonModuuli.vue';


@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpSpinner,
    EpPrefixList,
    EpOpintojaksonModuuli,
  },
})
export default class RouteOppiaine extends Mixins(EpRoute, EpOpsComponent) {
  private cache: PerusteCache | null = null;
  private oppiaine: Lops2019OppiaineDto | null = null;

  async init() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    this.oppiaine = await this.cache.getOppiaine(_.parseInt(this.$route.params.oppiaineId));
  }

  get opintojaksot() {
    return _.filter(this.store.opintojaksot, (oj) => _(oj.oppiaineet)
      .sortBy('koodi')
      .map('koodi')
      .includes(this.oppiaine!.koodi!.uri));
  }

  get pakollisetModuulit() {
    if (!this.oppiaine) {
      return null;
    }
    return _.chain(this.oppiaine.moduulit as any)
      .filter(moduuli => moduuli.pakollinen)
      .sortBy('koodi.arvo')
      .value();
  }

  get valinnaisetModuulit() {
    if (!this.oppiaine) {
      return null;
    }
    return _.chain(this.oppiaine.moduulit)
      .filter(moduuli => !moduuli.pakollinen)
      .sortBy('koodi.arvo')
      .value();
  }

  get moduulit() {
    return [
      ...this.pakollisetModuulit ? this.pakollisetModuulit : [],
      ...this.valinnaisetModuulit ? this.valinnaisetModuulit : [],
    ];
  }

  get isOppiaine() {
    return !(this.oppiaine as any)._oppiaine;
  }

  get isOppimaaria() {
    return this.oppiaine!.oppimaarat && this.oppiaine!.oppimaarat.length > 0;
  }

  public uusiOpintojakso() {
    this.$router.push({
      name: 'opintojakso',
      params: {
        ...this.$router.currentRoute.params,
        opintojaksoId: 'uusi',
      },
      query: {
        oppiaineet: _.get(this.oppiaine, 'koodi.uri'),
      },
    });
  }

}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.content {
  padding: 20px;
}

.oppimaarat-topic {
  padding: 10px 0px;
  color: $gray-lighten-1;
}

.oppimaarat {

  &:nth-child(2n) {
    background-color: #F9F9F9;
  }

  .om-content {
    display: flex;
    padding: 10px 20px;
  }

}

.oj-content {
  border-radius: 30px;
  padding: 10px 20px;
  display: flex;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: #e4f3cf;

  &.pakollinen {
    background-color: #eaf5fe;
  }

  span.nimi {
    flex: 1 0 auto;
  }

  span.pituus {
    min-width: 4em;
  }

  span.tyyppi {
    min-width: 6em;
  }
}

.collapse-container {
  padding-top: 30px;
  padding-bottom: 30px;

  div.ep-collapse {
    border-bottom: 1px solid #ccc;
    padding: 30px 10px 30px 0;
  }

  div.ep-collapse:last-child {
    border-bottom: none;
  }
}

.moduulit {
  display: flex;
  flex-wrap: wrap;

  .moduuli {
    margin: 0 10px 10px 0;
  }
}
</style>
