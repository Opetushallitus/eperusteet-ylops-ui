<template lang="pug">
.tekstiviite(v-if="hooks")
  .kappale
    ep-editointi(:hooks="hooks")
      template(slot="header" slot-scope="scope")
        .otsikko
          ep-input(
            v-if="scope.isEditing",
            type="text",
            v-model="scope.data.tov.tekstiKappale.nimi",
            :is-editing="true")
          h1(v-else)
            span {{ $kaanna(scope.data.tov.tekstiKappale.nimi) }}
            ep-button(variant="link" @click="addAlikappale(scope.data.tov)")
              fas(icon="plus")
              | &nbsp;&nbsp;
              span {{ $t('lisaa-alikappale') }}
      template(slot-scope="scope")
        .teksti
          .row
            .col-lg-8
              ep-content(v-model="scope.data.tov.tekstiKappale.teksti" :is-editable="scope.isEditing")
            .col-lg-4
              .ohjeet(v-if="scope.data.ohjeet.length > 0")
                .ohje(v-for="ohje in scope.data.ohjeet", :key="ohje.id", :class="'ohje-' + ohje.tyyppi")
                  ep-content(
                    v-model="ohje.teksti",
                    :is-editable="allowOhjeEdit && scope.isEditing")
              .infos
                .badges
                  span.badge.badge-pill.badge-light(v-if="scope.data.tov.omistussuhde !== 'oma'") {{ $t('vieras') }}
                  span.badge.badge-pill.badge-warning(v-if="scope.data.tov.pakollinen") {{ $t('pakollinen') }}
                  span
                    span.badge.badge-pill.badge-info(v-if="scope.data.tov.tekstiKappale.tila === 'luonnos'") {{ $t('luonnos') }}
                    span.badge.badge-pill.badge-success(v-if="scope.data.tov.tekstiKappale.tila === 'valmis'") {{ $t('valmis') }}
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
        font-size: 80%;
        color: #777;
      }

      .ohje-perusteteksti {
        background: #F5FBF0;
      }

      .ohje-ohje {
        background: #FBF1FA;
      }
    }

  }

  .alikappale {
  }

}

</style>
