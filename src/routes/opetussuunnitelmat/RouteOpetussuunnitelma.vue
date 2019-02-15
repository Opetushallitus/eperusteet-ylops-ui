<template lang="pug">
.opetussuunnitelma(v-if="ops")
  .header
    .progress
      apexchart(
        type="radialBar",
        :height="200",
        :options="graph.options",
        :series="graph.series")
    .info
      h1 {{ $kaanna(ops.nimi) }}
      h4.secondary {{ $t(ops.koulutustyyppi) }}
      h6.secondary {{ ops.perusteenDiaarinumero }}

  .lower
    ep-sidebar
      template(slot="bar")
        ops-sidenav
      template(slot="view")
        transition(name="fade" mode="out-in")
          router-view()
</template>

<script lang="ts" src="./script.ts" />

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.opetussuunnitelma {
  .header {
    min-height: $ops-header-height;
    background: $color-ops-header;
    display: flex;
    flex: stretch;

    * {
      background: $color-ops-header;
      color: $color-ops-header-text;
    }

    .progress {
      min-width: $sidebar-width;
      max-width: $sidebar-width;
      min-height: $ops-header-height;
      top: -34px;

      @media only screen and (max-width: 1024px) {
        display: none;
      }
    }
    .info {
      min-height: $ops-header-height;
      padding: 10px 30px 30px 30px;

      .secondary {
        color: #bbb;
      }
    }
  }

}

</style>
