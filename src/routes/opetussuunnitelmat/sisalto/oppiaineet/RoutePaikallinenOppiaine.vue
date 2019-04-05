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
              ep-form-content(name="oppiaine-nimi")
                ep-field(
                  help="oppiaine-nimi-ohje",
                  v-model="data.nimi",
                  :validation="validation.nimi",
                  :is-editing="isEditing")
            .col-md-6
              ep-form-content(name="opintopisteet")
                span {{ laajuus }} op
            .col-md-6
              ep-form-content(name="koodi")
                ep-field(
                  help="ops-hyvaksyjataho-ohje",
                  v-model="data.koodi",
                  :validation="validation.koodi",
                  :is-string="true",
                  :is-editing="isEditing")
            .col-md-6
              ep-form-content(name="tila")
                span Luonnos

        div
          hr.valiviiva
          ep-collapse
            h4(slot="header") {{ $t('tavoitteet') }}
            ep-content(v-model="data.tavoitteet.kuvaus" :is-editable="isEditing")

          hr.valiviiva
          ep-collapse
            h4(slot="header") {{ $t('keskeiset-sisallot') }}
            ep-content(v-model="data.keskeisetSisallot.kuvaus" :is-editable="isEditing")

          hr.valiviiva
          ep-collapse
            h4(slot="header") {{ $t('laaja-alaiset-sisallot') }}
            ep-content(v-model="data.laajaAlainenOsaaminen.kuvaus" :is-editable="isEditing")

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

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpColorBall,
    EpContent,
    EpEditointi,
    EpField,
    EpFormContent,
    EpPrefixList,
    EpSpinner,
  },
})
export default class RouteOpintojakso extends Mixins(EpRoute) {
  private oppiaineQuery = '';
  private editable: Lops2019OpintojaksoDto | null = null;
  private cache!: PerusteCache;
  private hooks: EditointiKontrolliConfig = {
    source: {
      save: this.save,
      load: this.load,
    },
    history: {
      revisions: this.revisions,
    },
  };

  async revisions() {
    return Opetussuunnitelma.getOpintojaksoHistoria(_.parseInt(this.$route.params.opintojaksoId));
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

  get oppiaineet() {
    return this.cache.peruste().oppiaineet;
  }

  get laajuus() {
    if (this.editable && this.editable.moduulit) {
      return _(this.editable.moduulit)
        .map('koodiUri')
        .map((uri: string) => this.moduulitMap[uri].laajuus)
        .sum();
    }
    else {
      return 0;
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

  get laajaAlaisetOsaamiset() {
    return _(this.editable!.oppiaineet)
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

  public async load() {
    const { opintojaksoId } = this.$route.params;
    const opintojakso = await Opetussuunnitelma.getOpintojakso(_.parseInt(opintojaksoId));
    return opintojakso;
  }

  async save(opintojakso: Lops2019OpintojaksoDto) {
    await Opetussuunnitelma.saveOpintojakso(opintojakso);
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
  margin-top: 10px;
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

