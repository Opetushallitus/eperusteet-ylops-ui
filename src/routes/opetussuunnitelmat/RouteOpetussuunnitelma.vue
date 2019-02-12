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
    .side
      ep-sidebar.sidebar
        .search
          .inlay
            input.form-control.megasearch(type="text" placeholder="Etsi")
            fas.inner-icon(icon="search")
        .item.active Tiedot
        .item Arvoperiaatteet
        .item Oppiaineet
    .view
      transition
        router-view()
</template>

<script lang="ts" src="./script.ts" />

<style scoped lang="scss">
@import "@/styles/_variables.scss";

// FIXME!!
.inlay {
  .inner-icon {
    color: $color-ops-header;
    position: relative;
    float: right;
    top: -27px;
    right: 10px;
  }
}

.sidebar {
  .item {
    padding: 24px 24px 24px 32px;
    border-left: 10px solid rgba(255, 255, 255, 0);
    color: $color-links;
  }

  .item.active {
    border-left: 10px solid $green-lighten-2;
    font-weight: 600;
  }

  .search {
    margin-bottom: 10px;
    padding: 10px 20px 10px 30px;

    input.megasearch {
      background: #F3F3F3;
      border: none;
      border-radius: 15px;
    }
  }
}

.opetussuunnitelma {
  .header {
    min-height: $ops-header-height;
    background: $color-ops-header;
    display: flex;

    * {
      background: $color-ops-header;
      color: $color-ops-header-text;
    }

    .progress {
      min-height: $ops-header-height;
      top: -34px;
      flex: 0 0 $sidebar-width;
    }
    .info {
      min-height: $ops-header-height;
      padding: 10px 30px 30px 30px;
      flex: 0 0 100%;

      .secondary {
        color: #bbb;
      }
    }
  }

  .lower {
    .side {
      border-right: 1px solid #ddd;
      position: fixed;
      height: 100%;
      overflow-x: hidden;
      width: $sidebar-width;
    }
    .view {
      margin-left: $sidebar-width;
    }
  }

}

</style>
