<template lang="pug">
.tekstiviite(v-if="hooks")
  .kappale
    ep-editointi(:hooks="hooks")
      template(slot="ohje", slot-scope="{ isEditing, data }")
        .sidepad
          p {{ $t('ohje-tekstikapale') }}
          p {{ $t('ohje-tekstikapale-perusteteksti') }}
          .ohjeet(v-if="data.ohjeet.length > 0")
            .ohje(v-for="ohje in data.ohjeet", :key="ohje.id")
              ep-content(
                v-model="ohje.teksti",
                :is-editable="allowOhjeEdit && isEditing")

      template(slot="keskustelu", slot-scope="{ isEditing, data }")
        span

      template(slot="peruste", slot-scope="{ isEditing, data }")
        .sidepad
          p(v-html="$kaanna(perusteenTeksti.perusteenOsa.teksti)")

      template(slot="header", slot-scope="{ isEditing, data }")
        .otsikko
          ep-field(
            v-if="data.tov.tekstiKappale",
            help="tekstikappale-nimi-ohje",
            v-model="data.tov.tekstiKappale.nimi",
            :is-header="true",
            :is-editing="isEditing")
          // :validation="validation.nimi",

      template(slot-scope="{ isEditing, data }")
        .teksti
          span(comment-uuid="data.tov.tekstiKappale.tunniste")
            .spacing
            ep-collapse(
              tyyppi="perusteteksti",
              v-if="(isEditing || data.tov.naytaPerusteenTeksti) && perusteenTeksti && perusteenTeksti.perusteenOsa")
              h5(slot="header") {{ $t('perusteen-teksti') }}
              p.perusteteksti(v-html="$kaanna(perusteenTeksti.perusteenOsa.teksti) ")
              .alert.alert-info(v-if="!isEditing && !$kaanna(perusteenTeksti.perusteenOsa.teksti)")
                | {{ $t('perusteen-sisaltoa-ei-maaritetty') }}
              div(v-if="isEditing")
                b-form-checkbox(v-model="data.tov.naytaPerusteenTeksti") {{ $t('nayta-perusteen-teksti') }}
            .spacing
            ep-collapse
              div(slot="header")
                h5 {{ $t('paikallinen-teksti') }}
              ep-content(v-model="data.tov.tekstiKappale.teksti", :is-editable="isEditing")
              .alert.alert-info(v-if="!isEditing && !$kaanna(data.tov.tekstiKappale.teksti)")
                | {{ $t('paikallista-sisaltoa-ei-maaritetty') }}
            // .col-lg-4
              .ohjeet(v-if="data.ohjeet.length > 0")
                .ohje(v-for="ohje in data.ohjeet", :key="ohje.id", :class="'ohje-' + ohje.tyyppi")
                  ep-content(
                    v-model="ohje.teksti",
                    :is-editable="allowOhjeEdit && isEditing")
              // .infos
                .badges
                  span.badge.badge-pill.badge-light(v-if="data.tov.omistussuhde !== 'oma'") {{ $t('vieras') }}
                  span.badge.badge-pill.badge-warning(v-if="data.tov.pakollinen") {{ $t('pakollinen') }}
                  span
                    span.badge.badge-pill.badge-info(v-if="data.tov.tekstiKappale.tila === 'luonnos'") {{ $t('luonnos') }}
                    span.badge.badge-pill.badge-success(v-if="data.tov.tekstiKappale.tila === 'valmis'") {{ $t('valmis') }}
// div
  tekstikappale-teksti(
    :ops-id="$route.params.id",
    :osa-id="$route.params.osaId",
    :key="$route.params.osaId",
    :allow-ohje-edit="isPohja")
</template>

<script lang="ts" src="./script.ts"></script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.badges {
  .badge {
    margin: 4px;
  }
}

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

    .spacing {
      margin-bottom: 20px;
    }

    .perusteteksti {
      font-style: italic;
      font-size: 80%;
    }

    .ohjeet {
      .ohje {
        padding: 10px;
        margin-bottom: 10px;
        color: #555;
      }

      .ohje-perusteteksti {
        background: #F5FBF0;
      }

      .ohje-ohje {
        background: #FBF1FA;
      }
    }

  }

  .sidepad {
    padding: 8px;
  }

  .alikappale {
  }

}
</style>
