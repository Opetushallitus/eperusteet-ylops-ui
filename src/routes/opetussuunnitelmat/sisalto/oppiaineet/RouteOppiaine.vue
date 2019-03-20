<template lang="pug">
div.content
  h2 Matematiikka
  div(v-if="hooks")
    ep-editointi(:hooks="hooks")
      template(slot-scope="scope")
        h4 Koodi
        h5 M4

        div.collapse-container
          ep-collapse
            h4(slot="header") Oppiaine ja tehtävä
            span tänne tulee sisältöä
          ep-collapse
            h4(slot="header") Laaja-alainen osaaminen
            span tänne tulee sisältöä
          ep-collapse
            h4(slot="header") Yleiset tavoitteet
            span tänne tulee sisältöä
          ep-collapse
            h4(slot="header") Arviointi
            span tänne tulee sisältöä

        h5 Opintojaksot
        span Täältä löydät oppiaineelle luodut opintojaksot

        div.block-container
          h5 Yhteinen opintokokonaisuus (1)
          router-link(
            tag="div",
            class="oj-content pakollinen",
            :to=`{ name: 'opintojakso', params: { jaksoId: 1 } }` )
            span.nimi Luvut ja lukujonot
            span.pituus 2 op
            span.tyyppi Pakollinen

        div.block-container
          h5 Matematiikan lyhyt oppimäärä (2)
          div.oj-content.pakollinen
            span.nimi Algoritmit
            span.pituus 2 op
            span.tyyppi Pakollinen
          div.oj-content.syventava
            span.nimi Analyyttinen geometria
            span.pituus 2 op
            span.tyyppi Syventävä

        div.block-container
          ep-button {{$t("lisaa-opintojakso")}}
</template>

<style lang="scss" scoped>
.oj-content {
  border-radius: 30px;
  padding: 10px 20px;
  display: flex;
  margin-top: 5px;
  margin-bottom: 5px;
  cursor: pointer;

  &.pakollinen {
    background-color: #eaf5fe;
  }

  &.syventava {
    background-color: #e4f3cf;
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
    border-top: 1px solid #ccc;
    padding: 10px 10px 10px 0;
  }

  div.ep-collapse:last-child {
    border-bottom: 1px solid #ccc;
  }
}
</style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import {
  EpButton,
  EpCollapse,
  EpEditointi,
} from '@/components';
import { EditointiKontrolliConfig } from '@/stores/editointi';

@Component({
  components: {
    EpEditointi,
    EpCollapse,
    EpButton,
  },
})
export default class RouteOppiaine extends Vue {
  private hooks: EditointiKontrolliConfig | null = null;

  mounted() {
    this.hooks = {
      source: {
        async save(param): Promise<object> {
          return new Promise<object>((resolve) => {
            // Todo: Toteuta tallentaminen
            resolve();
          });
        },
        async load(): Promise<Object> {
          return new Promise<Object>((resolve) => {
            resolve({});
          });
        },
      },
    };
  }

  private siirryOpintojaksoon() {

  }
}
</script>
