<template lang="pug">
.tekstiviite(v-if="value")
  .kappale(v-if="value.tekstiKappale")
    .otsikko
      .d-flex.justify-content-between
        .p-2
          h3 {{ $kaanna(value.tekstiKappale.nimi) }}
        .p-2
          .badges
            span.badge.badge-pill.badge-light(v-if="value.omistussuhde !== 'oma'") {{ $t('vieras') }}
            span.badge.badge-pill.badge-warning(v-if="value.pakollinen") {{ $t('pakollinen') }}
            span
              span.badge.badge-pill.badge-info(v-if="value.tekstiKappale.tila === 'luonnos'") {{ $t('luonnos') }}
              span.badge.badge-pill.badge-success(v-if="value.tekstiKappale.tila === 'valmis'") {{ $t('valmis') }}
    .teksti
      .row
        .col-lg
          p(v-html="$kaanna(value.tekstiKappale.teksti)")
        .col-lg.ohjeet(v-if="ohjeet.length > 0")
          .ohje(v-for="ohje in ohjeet")
            p(v-html="$kaanna(ohje.teksti)")

    // pre {{ value }}
  .alikappale
    tekstikappale-teksti(
      v-for="lapsi in value.lapset"
      :value="lapsi")
</template>

<script lang="ts" src="./script.ts"></script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.tekstiviite {
  .badges {
    .badge {
      margin: 4px;
    }
  }

  .kappale {
    .otsikko {
    }

    .teksti {
      margin-left: 20px;
    }

    .ohjeet {
      .ohje {
        font-size: 80%;
        color: #777;
      }
    }
  }

  .alikappale {
    margin-left: 8px;
  }

}

</style>
