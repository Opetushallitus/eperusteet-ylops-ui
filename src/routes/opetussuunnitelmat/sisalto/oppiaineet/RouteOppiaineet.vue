<template lang="pug">

div.content
  h1 {{ $t('oppiaineet') }}
  h2 {{ $t('valtakunnalliset') }}
  h2 {{ $t('paikalliset') }}
  ep-button(icon="plus", @click="uusiOppiaine()") {{ $t('lisaa-paikallinen-oppiaine') }}

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
import { Lops2019OppiaineDto } from '@/tyypit';
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
export default class RouteOppiaineet extends Mixins(EpRoute) {
  private cache: PerusteCache | null = null;
  private oppiaine: Lops2019OppiaineDto | null = null;

  async init() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    this.oppiaine = await this.cache.getOppiaine(_.parseInt(this.$route.params.oppiaineId));
  }

  public uusiOppiaine() {
    this.$router.push({
      name: 'paikallinenOppiaine',
      params: {
        ...this.$router.currentRoute.params,
        paikallinenOppiaineId: 'uusi',
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
