<template lang="pug">

div.content
  ep-spinner(v-if="isLoading")
  div(v-if="!isLoading")
    h2 {{ $kaanna(oppiaine.nimi) }} ({{ oppiaine.koodi.arvo }})

    div.collapse-container
      ep-collapse(v-if="oppiaine.tehtava")
        h4(slot="header") {{ $t('oppiaineet-tehtava') }}
        ep-content(v-model="oppiaine.tehtava.kuvaus")

      ep-collapse(v-if="oppiaine.laajaAlainenOsaaminen")
        h4(slot="header") {{ $t('laaja-alainen-osaaminen') }}
        ep-content(v-model="oppiaine.laajaAlainenOsaaminen.kuvaus")

      // FIXME: ei välttämättä ole
      // ep-collapse
        h4(slot="header") {{ $t('yleiset-tavoitteet') }}
        span tänne tulee sisältöä

      ep-collapse(v-if="oppiaine.arviointi")
        h4(slot="header") {{ $t('arviointi') }}
        ep-content(v-model="oppiaine.arviointi.kuvaus")

      ep-collapse(v-if="oppiaine.oppimaarat.length > 0")
        h4(slot="header") {{ $t('oppimaarat') }}
        div.block-container(v-for="oppimaara in oppiaine.oppimaarat", :key="oppimaara.id")
          router-link.oj-content(:to=`{ name: 'oppiaine', params: { oppiaineId: oppimaara.id } }` )
            span.nimi {{ $kaanna(oppimaara.nimi) }}
        // ep-button(icon="plus")
          | {{ $t('lisaa-oppimaara') }}

      ep-collapse(v-if="oppiaine.moduulit.length > 0")
        h4(slot="header") {{ $t('moduulit') }}
        div.block-container
          h5 {{ $t('pakolliset-moduulit') }}
          div(v-for="moduuli in pakollisetModuulit", :key="moduuli.id")
            .oj-content.pakollinen
              span.nimi
                router-link(:to=`{ name: 'moduuli', params: { moduuliId: moduuli.id } }`)
                  | {{ $kaanna(moduuli.nimi) }}
              span.pituus {{ moduuli.laajuus }} op
              span.tyyppi {{ $t('pakollinen') }}

        div.block-container
          h5 {{ $t('valinnaiset-moduulit') }}
          div(v-for="moduuli in valinnaisetModuulit", :key="moduuli.id")
            .oj-content
              span.nimi
                router-link(:to=`{ name: 'moduuli', params: { moduuliId: moduuli.id } }`)
                  | {{ $kaanna(moduuli.nimi) }}
              span.pituus {{ moduuli.laajuus }} op
              span.tyyppi {{ $t('valinnainen') }}

      ep-spinner(v-if="!opintojaksot")
      ep-collapse(v-else)
        h4(slot="header") {{ $t('opintojaksot') }}
        div(v-if="opintojaksot.length === 0")
          .alert.alert-info {{ $t('opintojaksoja-ei-lisatty') }}
        div(v-else)
          div.block-container(v-for="opintojakso in opintojaksot", :key="opintojakso.id")
            .oj-content.pakollinen
              span.nimi
                router-link(:to=`{ name: 'opintojakso', params: { opintojaksoId: opintojakso.id } }`)
                  | {{ $kaanna(opintojakso.nimi) }}
              span.pituus 2 op
        ep-button(icon="plus", @click="uusiOpintojakso()") {{ $t('uusi-opintojakso') }}

</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import {
  EpButton,
  EpCollapse,
  EpContent,
  EpEditointi,
  EpSpinner,
} from '@/components';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019OppiaineDto, Lops2019OpintojaksoDto } from '@/tyypit';
import EpRoute from '@/mixins/EpRoute';
import { PerusteCache } from '@/stores/peruste';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import _ from 'lodash';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpSpinner,
  },
})
export default class RouteOppiaine extends Mixins(EpRoute) {
  private cache: PerusteCache | null = null;
  private oppiaine: Lops2019OppiaineDto | null = null;

  async init() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    this.oppiaine = await this.cache.getOppiaine(_.parseInt(this.$route.params.oppiaineId));
    this.breadcrumb('oppiaine', this.oppiaine!.nimi);
  }

  get opintojaksot() {
    return _.filter(Opetussuunnitelma.opintojaksot, (oj) => _(oj.oppiaineet)
      .map('koodi')
      .includes(this.oppiaine!.koodi!.uri));
  }

  get pakollisetModuulit() {
    if (!this.oppiaine) {
      return null;
    }
    return _.filter(this.oppiaine.moduulit, moduuli => moduuli.pakollinen);
  }

  get valinnaisetModuulit() {
    if (!this.oppiaine) {
      return null;
    }
    return _.reject(this.oppiaine.moduulit, moduuli => moduuli.pakollinen);
  }

  public uusiOpintojakso() {
    this.$router.push({
      name: 'opintojakso',
      params: {
        ...this.$router.currentRoute.params,
        opintojaksoId: 'uusi',
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
