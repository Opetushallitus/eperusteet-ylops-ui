<template>
<div class="tekstiviite" v-if="hooks">
  <div class="kappale">
    <ep-editointi :hooks="hooks">
      <template slot="ohje" slot-scope="{ isEditing, data }">
        <div class="sidepad">
          <p>{{ $t('ohje-tekstikapale') }}</p>
          <p>{{ $t('ohje-tekstikapale-perusteteksti') }}</p>
          <div class="ohjeet" v-if="data.ohjeet.length > 0">
            <div class="ohje" v-for="ohje in data.ohjeet" :key="ohje.id">
              <ep-content v-model="ohje.teksti" :is-editable="allowOhjeEdit && isEditing">
              </ep-content>
            </div>
          </div>
        </div>
      </template>
      <template slot="keskustelu" slot-scope="{ }">
        <span>
        </span>
      </template>
      <template slot="peruste" slot-scope="{ data }">
        <div class="sidepad">
          <p v-html="$kaanna(perusteenTeksti.perusteenOsa.teksti)" />
        </div>
      </template>
      <template slot="header" slot-scope="{ isEditing, data }">
        <div class="otsikko">
          <ep-field v-if="data.tov.tekstiKappale" help="tekstikappale-nimi-ohje" v-model="data.tov.tekstiKappale.nimi" :is-header="true" :is-editing="isEditing">
          </ep-field>
        </div>
      </template>
      <template slot-scope="{ isEditing, data }">
        <div class="teksti">
          <span comment-uuid="data.tov.tekstiKappale.tunniste">
            <div class="spacing">
            </div>
            <ep-collapse tyyppi="perusteteksti" v-if="(isEditing || data.tov.naytaPerusteenTeksti) && perusteenTeksti && perusteenTeksti.perusteenOsa">
              <h5 slot="header">{{ $t('perusteen-teksti') }}</h5>
              <p class="perusteteksti" v-html="$kaanna(perusteenTeksti.perusteenOsa.teksti) ">
              </p>
              <div class="alert alert-info" v-if="!isEditing && !$kaanna(perusteenTeksti.perusteenOsa.teksti)">{{ $t('perusteen-sisaltoa-ei-maaritetty') }}</div>
              <div v-if="isEditing">
                <b-form-checkbox v-model="data.tov.naytaPerusteenTeksti">{{ $t('nayta-perusteen-teksti') }}</b-form-checkbox>
              </div>
            </ep-collapse>
            <div class="spacing">
            </div>
            <ep-collapse>
              <template #header>
                <h5>{{ $t('paikallinen-teksti') }}</h5>
              </template>
              <ep-content v-model="data.tov.tekstiKappale.teksti" :is-editable="isEditing">
              </ep-content>
              <div class="alert alert-info" v-if="!isEditing && !$kaanna(data.tov.tekstiKappale.teksti)">{{ $t('paikallista-sisaltoa-ei-maaritetty') }}</div>
            </ep-collapse>
          </span>
        </div>
      </template>
    </ep-editointi>
  </div>
  <tekstikappale-teksti
    :ops-id="$route.params.id"
    :osa-id="$route.params.osaId"
    :key="$route.params.osaId"
    :allow-ohje-edit="isPohja" />
</div>
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
