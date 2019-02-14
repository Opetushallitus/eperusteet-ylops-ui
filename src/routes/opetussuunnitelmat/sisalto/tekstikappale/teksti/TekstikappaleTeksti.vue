<template lang="pug">
.tekstiviite(v-if="value && hooks")
  .kappale(v-if="value.tekstiKappale")
    ep-editointi(:hooks="hooks")
      template(slot="header" slot-scope="scope")
        .otsikko
          h3 {{ $kaanna(scope.data.tekstiKappale.nimi) }}
      template(slot-scope="scope")
        .teksti
          .row
            .col-lg-8
              p(v-html="$kaanna(scope.data.tekstiKappale.teksti)")
              // ep-content(v-model="scope.data.tekstiKappale.teksti" :is-editing="scope.isEditing")
            .col-lg-4
              .ohjeet(v-if="ohjeet.length > 0")
                .ohje(v-for="ohje in ohjeet")
                  p(v-html="$kaanna(ohje.teksti)")
              .infos
                .badges
                  span.badge.badge-pill.badge-light(v-if="scope.data.omistussuhde !== 'oma'") {{ $t('vieras') }}
                  span.badge.badge-pill.badge-warning(v-if="scope.data.pakollinen") {{ $t('pakollinen') }}
                  span
                    span.badge.badge-pill.badge-info(v-if="scope.data.tekstiKappale.tila === 'luonnos'") {{ $t('luonnos') }}
                    span.badge.badge-pill.badge-success(v-if="scope.data.tekstiKappale.tila === 'valmis'") {{ $t('valmis') }}

    // pre {{ value }}
  .alikappale
    tekstikappale-teksti(
      v-for="lapsi in value.lapset"
      :key="lapsi.id"
      :value="lapsi")
</template>

<script lang="ts" src="./script.ts"></script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.tekstiviite {
  .kappale {
    .otsikko {
    }

    .teksti {
      margin-left: 0px;
    }

    .infos {
      margin-bottom: 20px;

      .badges {
        .badge {
          margin: 0 4px 0 4px;
        }
      }
    }

    .ohjeet {
      .ohje {
        padding: 10px;
        margin-bottom: 10px;
        border-left: 5px solid #eee;
        font-size: 80%;
        color: #777;
      }
    }

  }

  .alikappale {
  }

}

</style>
