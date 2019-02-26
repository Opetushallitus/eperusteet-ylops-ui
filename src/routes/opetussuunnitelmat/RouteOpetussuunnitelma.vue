<template lang="pug">
.opetussuunnitelma(v-if="ops")
  .header
    .progress
      div
        ep-chart(
          labelColor="white",
          :chartColor="graph.colorScheme",
          :value="graph.value")
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
          router-view(:key="$route.fullPath")

</template>

<script lang="ts" src="./script.ts" />

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.opetussuunnitelma {
  .header {
    height: $ops-header-height;
    background: $color-ops-header;
    display: flex;
    flex: stretch;
    align-items: center;

    * {
      background: $color-ops-header;
      color: $color-ops-header-text;
    }

    .progress {
      width: $sidebar-width;
      height: 150px;

      @media only screen and (max-width: 1024px) {
        display: none;
      }
    }

    .progress > div {
      width: 150px;
      margin: 0 auto;
    }

    .info {
      .secondary {
        color: #bbb;
      }

      @media only screen and (max-width: 768px) {
        padding-left: 30px;
      }

    }
  }

}

</style>
