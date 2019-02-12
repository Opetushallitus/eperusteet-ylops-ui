<template lang="pug">
.opetussuunnitelma(v-if="ops")
  .header
    .progress
      apexchart(
        type="radialBar",
        :width="200"
        :height="200",
        :options="graph.options",
        :series="graph.series")
    .info
      h1 {{ $kaanna(ops.nimi) }}
      h6 {{ ops.perusteenDiaarinumero }}

  .lower
    .sidebar
    .content
      transition
        router-view()
</template>

<script lang="ts" src="./script.ts" />

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.opetussuunnitelma {
  .header {
    min-height: 180px;
    background: $color-ops-header;
    display: flex;

    * {
      background: $color-ops-header;
      color: $color-ops-header-text;
    }

    .progress {
      min-height: 180px;
      top: -14px;
      flex: 0 0 200px;
    }
    .info {
      min-height: 180px;
      padding: 30px;
      flex: 0 0 100%;
    }
  }
}

</style>
