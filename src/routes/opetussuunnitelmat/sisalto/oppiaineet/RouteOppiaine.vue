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
        <h4 slot="header">{{ $t('oppiaineet-tehtava') }}</h4>
        <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="oppiaine.tehtava.kuvaus"> </ep-content>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.laajaAlaisetOsaamiset">
        <h4 slot="header">{{ $t('laaja-alainen-osaaminen') }}</h4>
        <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="oppiaine.laajaAlaisetOsaamiset.kuvaus"> </ep-content>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.tavoitteet">
        <h4 slot="header">{{ $t('tavoitteet') }}</h4>
        <ep-content layout="normal" opetussuunnitelma-store="opetussuunnitelmaStore" v-model="oppiaine.tavoitteet.kuvaus"></ep-content>
        <ep-prefix-list :value="oppiaine.tavoitteet.tavoitealueet" kohde="kohde" arvot="tavoitteet"></ep-prefix-list>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.arviointi">
        <h4 slot="header">{{ $t('arviointi') }}</h4>
        <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="oppiaine.arviointi.kuvaus"></ep-content>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.oppimaarat && oppiaine.oppimaarat.length > 0">
        <h4 slot="header">{{ $t('oppimaarat') }}</h4>
        <div class="block-container" v-for="oppimaara in oppiaine.oppimaarat" :key="oppimaara.id">
          <router-link class="oj-content" :to="{ name: 'oppiaine', params: { oppiaineId: oppimaara.id } }">
            <span class="nimi">{{ $kaanna(oppimaara.nimi) }}</span>
          </router-link>
        </div>
      </ep-collapse>
      <ep-collapse v-if="oppiaine.moduulit && oppiaine.moduulit.length > 0">
        <h4 slot="header">{{ $t('moduulit') }}</h4>
        <div class="block-container">
          <h5>{{ $t('pakolliset-moduulit') }}</h5>
          <ep-content v-if="oppiaine.pakollisetModuulitKuvaus"
                      layout="normal"
                      :opetussuunnitelma-store="opetussuunnitelmaStore"
                      v-model="oppiaine.pakollisetModuulitKuvaus"></ep-content>
          <div v-for="moduuli in pakollisetModuulit" :key="moduuli.id">
            <div class="oj-content pakollinen">
              <span class="nimi">
                <router-link :to="{ name: 'moduuli', params: { moduuliId: moduuli.id } }">{{ $kaanna(moduuli.nimi) }}</router-link>
              </span>
              <span class="pituus">{{ moduuli.laajuus }} {{ $t('opintopiste') }}</span>
              <span class="tyyppi">{{ $t('pakollinen') }}</span>
            </div>
          </div>
        </div>
        <div class="block-container">
          <h5>{{ $t('valinnaiset-moduulit') }}</h5>
          <ep-content v-if="oppiaine.valinnaisetModuulitKuvaus"
                      layout="normal"
                      :opetussuunnitelma-store="opetussuunnitelmaStore"
                      v-model="oppiaine.valinnaisetModuulitKuvaus"></ep-content>
          <div v-for="moduuli in valinnaisetModuulit" :key="moduuli.id">
            <div class="oj-content">
              <span class="nimi">
                <router-link :to="{ name: 'moduuli', params: { moduuliId: moduuli.id } }">{{ $kaanna(moduuli.nimi) }}</router-link>
              </span>
              <span class="pituus">{{ moduuli.laajuus }} {{ $t('opintopiste') }}</span>
              <span class="tyyppi">{{ $t('valinnainen') }}</span>
            </div>
          </div>
        </div>
      </ep-collapse>
      <ep-spinner v-if="!opintojaksot">
      </ep-spinner>
      <ep-collapse v-else>
        <h4 slot="header">{{ $t('opintojaksot') }}</h4>
        <div v-if="opintojaksot.length === 0">
          <div class="alert alert-info">{{ $t('opintojaksoja-ei-lisatty') }}</div>
        </div>
        <div v-else>
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
        <ep-button icon="plus" @click="uusiOpintojakso()">{{ $t('uusi-opintojakso') }}</ep-button>
      </ep-collapse>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import {
  EpButton,
  EpCollapse,
  EpContent,
  EpEditointi,
  EpSpinner,
  EpPrefixList,
} from '@/components';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019OppiaineDto, Lops2019OpintojaksoDto } from '@/tyypit';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { PerusteCache } from '@/stores/peruste';
import _ from 'lodash';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpSpinner,
    EpPrefixList,
  },
})
export default class RouteOppiaine extends Mixins(EpRoute, EpOpsComponent) {
  private cache: PerusteCache | null = null;
  private oppiaine: Lops2019OppiaineDto | null = null;

  async init() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    this.oppiaine = await this.cache.getOppiaine(_.parseInt(this.$route.params.oppiaineId));
    this.breadcrumb('oppiaine', this.oppiaine!.nimi);
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
.content {
  padding: 20px;
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

.block-container {
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
</style>
