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
          router-link.oj-content(
            tag="div",
            :to=`{ name: 'opintojakso', params: { jaksoId: 1 } }` )
            span.nimi {{ $kaanna(oppimaara.nimi) }}

      ep-collapse(v-if="oppiaine.moduulit.length > 0")
        h4(slot="header") {{ $t('moduulit') }}
        div.block-container(v-for="moduuli in oppiaine.moduulit", :key="moduuli.id")
          .oj-content(:class="moduuli.pakollinen && 'pakollinen'")
            span.nimi
              router-link(:to=`{ name: 'moduuli', params: { moduuliId: moduuli.id } }`)
               | {{ $kaanna(moduuli.nimi) }}
            span.pituus {{ moduuli.laajuus }} op
            span.tyyppi {{ $t(moduuli.pakollinen ? 'pakollinen' : 'valinnainen') }}

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
  private opintojaksot: Lops2019OpintojaksoDto[] = [];

  async init() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    this.oppiaine = await this.cache.getOppiaine(_.parseInt(this.$route.params.oppiaineId));
    this.opintojaksot = await Opetussuunnitelma.getOpintojaksot({
      oppiaineUri: this.oppiaine!.koodi!.uri as string,
    } as any);
  }
}
</script>

<style lang="scss" scoped>
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
  padding-top: 20px;
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
