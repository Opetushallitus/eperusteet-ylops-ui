<template lang="pug">
div.content
  div(v-if="hooks && !isLoading")
    ep-editointi(:hooks="hooks", v-model="editable", :validator="validator")
      template(slot="header", slot-scope="{ data, validation, isEditing }")
        h2 {{ $kaanna(data.nimi) }}

      template(v-slot="{ data, validation, isEditing }")
        div
          .row
            .col-md-6
              ep-form-content(name="opintojakso-nimi")
                ep-field(
                  help="opintojakso-nimi-ohje",
                  v-model="data.nimi",
                  :validation="validation.nimi",
                  :is-editing="isEditing")
            .col-md-6
              ep-form-content(name="opintopisteet")
                span {{ laajuus }} op
            .col-md-6
              ep-form-content(name="koodi")
                ep-field(
                  help="opintojakso-koodi-ohje",
                  v-model="data.koodi",
                  type="string",
                  :validation="validation.koodi",
                  :is-editing="isEditing")
            .col-md-6
              ep-form-content(name="tila")
                span Luonnos

        div(v-if="isEditing || data.moduulit.length > 0")
          hr.valiviiva
          ep-collapse(tyyppi="opintojakson-moduulit")
            h4(slot="header")
              | {{ $t('opintojakson-moduulit') }}
            div(v-if="isEditing")
              .row
                .col-md-6
                  ep-form-content(name="oppiaine")
                    ep-oppiaine-selector(
                      :ops-id="$route.params.id",
                      :value="data.oppiaineet.map(x => x.koodi)",
                      @input="updateOppiaineet")
                .col-md-6
                  // ep-form-content(name="liitetyt-moduulit")
                    .liitetyt-moduulit
                      div.d-flex
                        .p-2.flex-grow-1
                          ep-color-ball(kind="pakollinen")
                          span.taso {{ $t('pakolliset') }}
                        .p-2
                          span {{ liitetyt.pakolliset.valittu }} / {{ liitetyt.pakolliset.max }}
                      div.d-flex
                        .p-2.flex-grow-1
                          ep-color-ball(kind="syventava")
                          span.taso {{ $t('syventavat') }}
                        .p-2
                          span {{ liitetyt.syventavat.valittu }} / {{ liitetyt.syventavat.max }}
                      div.d-flex
                        .p-2.flex-grow-1
                          ep-color-ball(kind="paikallinen")
                          span.taso {{ $t('paikalliset') }}
                        .p-2
                          span {{ liitetyt.paikalliset.valittu }} / {{ liitetyt.paikalliset.max }}

            .oppiaineet(v-if="isEditing")
              div(v-for="oa in data.oppiaineet", :key="oa.koodi")
                h5 {{ $kaanna(oppiaineetMap[oa.koodi].nimi) }}
                div(v-if="!oppiaineetMap[oa.koodi].moduulit || oppiaineetMap[oa.koodi].moduulit.length === 0")
                  ep-input(
                    type="number",
                    ohje="opintojakso-oppiaine-laajuus",
                    v-model="oa.laajuus",
                    :is-editing="true")
                .moduulit
                  .moduuli(v-for="moduuli in oppiaineetMap[oa.koodi].moduulit", :key="moduuli.id")
                    ep-opintojakson-moduuli(
                      :moduuli="moduuli",
                      :is-editing="true",
                      v-model="data.moduulit")

            .oppiaineet(v-if="!isEditing")
              .moduulit
                .moduuli(v-for="moduuli in editable.moduulit", :key="moduuli.id")
                  ep-opintojakson-moduuli(
                    :moduuli="moduulitMap[moduuli.koodiUri]",
                    :value="data.moduulit")

            .moduulilista(v-if="isEditing && editable.moduulit.length > 0")
              h5 {{ $t('valitut-moduulit') }}
              div(v-for="moduuli in editable.moduulit")
                .d-flex
                  .p-2.flex-grow-1
                    fas.checked(icon="check")
                    span.nimi {{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}
                  .p-2
                    span.laajuus {{ moduulitMap[moduuli.koodiUri].laajuus }} op
                    ep-color-ball()

        div
          hr.valiviiva
          ep-collapse(tyyppi="opintojakson-tavoitteet")
            h4(slot="header") {{ $t('tavoitteet') }}
            //.perustesisalto(v-for="tavoite in oppiaineidenTavoitteet")
              h5 {{ $kaanna(tavoite.nimi) }}
              h5(v-if="") {{ $kaanna(tavoite.nimi) }}
              ep-prefix-list(
                :value="tavoite.tavoitteet",
                kohde="kohde",
                arvot="tavoitteet")
            .perustesisalto(v-for="moduuli in data.moduulit")
              h5 {{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}
              // h5(v-if="") {{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}
              ep-prefix-list(
                :value="moduulitMap[moduuli.koodiUri].tavoitteet",
                kohde="kohde",
                arvot="tavoitteet")
            ep-content(
              layout="normal",
              v-model="data.tavoitteet",
              :is-editable="isEditing")

          hr.valiviiva
          ep-collapse(tyyppi="opintojakson-keskeiset-sisallot")
            h4(slot="header") {{ $t('keskeiset-sisallot') }}
            .perustesisalto(v-for="moduuli in data.moduulit")
              h5 {{ $kaanna(moduulitMap[moduuli.koodiUri].nimi) }}
              ep-prefix-list(
                :value="moduulitMap[moduuli.koodiUri].sisallot",
                kohde="kohde",
                arvot="sisallot")
            ep-content(
              layout="normal",
              v-model="data.keskeisetSisallot",
              :is-editable="isEditing")

          hr.valiviiva
          ep-collapse(tyyppi="opintojakson-keskeiset-sisallot")
            h4(slot="header") {{ $t('laaja-alaiset-sisallot') }}
            .perustesisalto(
              v-for="oppiaine in laajaAlaisetOsaamiset",
              v-if="oppiaine.laajaAlainenOsaaminen && oppiaine.laajaAlainenOsaaminen.kuvaus")
              h5(v-html="$kaanna(oppiaine.nimi)")
              ep-content(:value="oppiaine.laajaAlainenOsaaminen.kuvaus")
            ep-content(
              layout="normal",
              v-model="data.laajaAlainenOsaaminen",
              :is-editable="isEditing")

</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import {
  EpButton,
  EpCollapse,
  EpColorBall,
  EpContent,
  EpEditointi,
  EpField,
  EpFormContent,
  EpInput,
  EpMultiSelect,
  EpOppiaineSelector,
  EpPrefixList,
  EpSpinner,
} from '@/components';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto } from '@/tyypit';
import { Opintojaksot } from '@/api';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { PerusteCache } from '@/stores/peruste';
import EpRoute from '@/mixins/EpRoute';
import _ from 'lodash';
import EpOpintojaksonModuuli from './EpOpintojaksonModuuli.vue';
import { opintojaksoValidator } from '@/validators/opintojakso';
import { Kielet } from '@/stores/kieli';
import Multiselect from 'vue-multiselect';
import * as defaults from '@/defaults';


@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorBall,
    EpContent,
    EpEditointi,
    EpField,
    EpFormContent,
    EpInput,
    EpMultiSelect,
    EpOpintojaksonModuuli,
    EpOppiaineSelector,
    EpPrefixList,
    EpSpinner,
    Multiselect,
  },
})
export default class RouteOpintojakso extends Mixins(EpRoute) {
  private oppiaineQuery = '';
  private editable: Lops2019OpintojaksoDto | null = null;
  private cache!: PerusteCache;
  private hooks: EditointiKontrolliConfig = {
    editAfterLoad: this.isUusi,
    source: {
      save: this.save,
      load: this.load,
    },
    history: {
      revisions: this.revisions,
    },
  };

  async isUusi() {
    return this.$route.params.opintojaksoId === 'uusi';
  }

  async revisions() {
    if (await this.isUusi()) {
      return [];
    }
    else {
      return Opetussuunnitelma.getOpintojaksoHistoria(_.parseInt(this.$route.params.opintojaksoId));
    }
  }

  async init() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
  }

  get liitetyt() {
    return {
      pakolliset: {
        valittu: 3,
        max: 8,
      },
      syventavat: {
        valittu: 0,
        max: 1,
      },
      paikalliset: {
        valittu: 0,
        max: 0,
      },
    };
  }

  get validator() {
    return opintojaksoValidator([
      Kielet.getSisaltoKieli(), // Validoidaan kentät sisältökielen mukaan
    ]);
  }

  get paikallisetOppiaineet() {
    return _(Opetussuunnitelma.paikallisetOppiaineet)
      .filter('koodi')
      .map((oa) => {
        return {
          ...oa,
          koodi: {
            uri: oa.koodi,
          }
        };
      })
      .value();
  }

  get oppiaineet() {
    return [
        ...this.cache.peruste().oppiaineet,
        ...this.paikallisetOppiaineet
      ];
  }

  get laajuus() {
    if (this.editable && this.editable.moduulit && !_.isEmpty(this.editable.moduulit)) {
      return _(this.editable.moduulit)
        .map('koodiUri')
        .map((uri: string) => this.moduulitMap[uri].laajuus)
        .sum();
    }
    else {
      return _(this.editable!.oppiaineet)
        .filter('laajuus')
        .map('laajuus')
        .sum();
    }
  }

  get oppiaineetMap() {
    return _.keyBy(this.oppiaineetJaOppimaarat, 'koodi.uri');
  }

  get moduulit() {
    return _(this.oppiaineetJaOppimaarat)
      .map((oa) => _.map(oa.moduulit, (moduuli) => ({
        ...moduuli,
        oppiaineUri: oa.koodi.uri,
      })))
      .flatten()
      .value() as (Lops2019ModuuliDto & { oppiaineUri: string })[];
  }

  get moduulitMap() {
    return _(this.moduulit)
      .keyBy('koodi.uri')
      .value();
  }

  get oppiaineetJaOppimaarat() {
    return _(this.oppiaineet)
      .map((oa: any) => [oa, ..._.map(oa.oppimaarat, om => ({
        ...om,
        parentUri: oa.koodi.uri,
      }))])
      .flatten()
      .value();
  }

  get filteredOppiaineet() {
    return _(this.oppiaineetJaOppimaarat)
      .filter((org) => Kielet.search(this.oppiaineQuery, org.nimi))
      .map('koodi.uri')
      .value();
  }

  get opintojaksonOppiaineet() {
    return _(this.editable!.oppiaineet)
      .map(({ koodi }) => koodi)
      .sortBy()
      .uniq()
      .map(uri => {
        if (this.oppiaineetMap[uri].parentUri) {
          return [this.oppiaineetMap[uri].parentUri, uri];
        }
        else {
          return [uri];
        }
      })
      .flatten()
      .map((uri: string) => this.oppiaineetMap[uri])
      .value();
  }

  get oppiaineidenTavoitteet() {
    interface Tavoitteet {
      nimi: any;
      tavoitteet: any;
    };

    if (_.isEmpty(this.editable!.moduulit)) {
      return _(this.opintojaksonOppiaineet)
        .map(oa => {
          return {
            kind: 'oppiaine',
            nimi: oa.nimi,
            kuvaus: oa.kuvaus,
            tavoitteet: oa.tavoitteet,
          };
        })
        .value();
    }
    else {
      return _(this.editable!.moduulit)
        .map(moduuli => {
          return {
            kind: 'moduuli',
            nimi: moduuli.nimi,
            kuvaus: null,
            tavoitteet: moduuli.tavoitteet,
          };
        })
        .value();
    }
  }

  get laajaAlaisetOsaamiset() {
    return _(this.editable!.oppiaineet)
      .map(({ koodi }) => koodi)
      .map(uri => {
        if (this.oppiaineetMap[uri].parentUri) {
          return [this.oppiaineetMap[uri].parentUri, uri];
        }
        else {
          return [uri];
        }
      })
      .flatten()
      .uniq()
      .map((uri: string) => this.oppiaineetMap[uri])
      .value();
  }

  private updateOppiaineet(koodit: string[]) {
    this.editable!.oppiaineet = _.map(koodit, (koodi) => ({
      koodi,
    }));
  }

  public async load() {
    const { opintojaksoId } = this.$route.params;
    if (opintojaksoId === 'uusi') {
      return defaults.opintojakso();
    }
    else {
      const opintojakso = await Opetussuunnitelma.getOpintojakso(_.parseInt(opintojaksoId));
      return opintojakso;
    }
  }

  async save(opintojakso: Lops2019OpintojaksoDto) {
    if (await this.isUusi()) {
      const uusi = await Opetussuunnitelma.addOpintojakso(opintojakso);
      this.$router.push({
        ...(this.$router.currentRoute as any),
        params: {
          ...this.$router.currentRoute.params,
          opintojaksoId: uusi.id,
        },
      });
    }
    else {
      await Opetussuunnitelma.saveOpintojakso(opintojakso);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables.scss";

.moduulit {
  display: flex;
  flex-wrap: wrap;

  .moduuli {
    margin: 0 10px 10px 0;
  }
}

.liitetyt-moduulit {
  .taso {
    margin-left: 8px;
  }
}

hr.valiviiva {
  margin: 30px 0 30px 0;
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

.perustesisalto {
  font-size: 80%;
  padding: 5px;
  margin-bottom: 10px;
  color: #555;
}

.moduulilista {
  .checked {
    color: $blue-lighten-1;
  }

  span.nimi {
    padding: 5px;
  }

  span.laajuus {
    padding: 5px;
  }
}

</style>
