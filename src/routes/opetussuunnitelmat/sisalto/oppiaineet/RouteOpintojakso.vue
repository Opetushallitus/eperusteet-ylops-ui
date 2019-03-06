<template lang="pug">
div.content
  h2 Yhteinen opintokokonaisuus
  h3 Luvut ja lukujonot
  div(v-if="hooks")
    ep-editointi(:hooks="hooks")
      template(slot-scope="scope")
        div
          span {{$t('opintopisteet')}}
          span 2op

        div
          span {{$t('opintojakson-tila')}}
          span {{$t('valmis')}}

        div.block-container
          h3 {{$t('opintojakson-modulit')}}

          div.moduli
            span.nimi Vektorianalyysi
            span.pituus 2 op

          div.moduli
            span.nimi Matriisilaskenta
            span.pituus 2 op

        div.collapse-container
          ep-collapse
            h4(slot="header") Tavoitteet (perusteet)
            span tänne tulee sisältöä
          ep-collapse
            h4(slot="header") Keskeiset sisällöt
            span tänne tulee sisältöä

</template>

<style lang="scss" scoped>
.moduli {
  .nimi {
    width: 40em;
    display: inline-block;
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
    padding: 10px 10px 10px 0px;
  }

  div.ep-collapse:last-child {
    border-bottom: 1px solid #ccc;
  }
}
</style>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import EpButton from '@/components/EpButton/EpButton.vue';
import EpCollapse from '@/components/EpCollapse/EpCollapse.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';

@Component({
  components: {
    EpEditointi,
    EpCollapse,
    EpButton,
  },
})
export default class RouteOpintojakso extends Vue {
  private hooks: EditointiKontrolliConfig | null = null;

  mounted() {
    this.hooks = {
      source: {
        async save(param) {
        },
        async load() {
          return {};
        },
      },
    };
  }

}
</script>