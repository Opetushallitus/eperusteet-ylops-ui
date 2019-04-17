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
              ep-form-content(name="koodi")
                ep-field(
                  help="oppiaine-koodi-ohje",
                  v-model="data.koodi",
                  :validation="validation.koodi",
                  :is-string="true",
                  :is-editing="isEditing")

        div
          hr.valiviiva
          ep-collapse(tyyppi="kuvaus")
            h4.header(slot="header") {{ $t('oppiaineen-kuvaus') }}
            ep-content(v-model="data.kuvaus" :is-editable="isEditing")

          hr.valiviiva
          ep-collapse(tyyppi="tehtava")
            h4.header(slot="header") {{ $t('tehtava') }}
            ep-content(v-model="data.tehtava.kuvaus" :is-editable="isEditing")

          hr.valiviiva
          ep-collapse(tyyppi="tavoitteet")
            h4.header(slot="header") {{ $t('tavoitteet') }}
            ep-content(v-model="data.tavoitteet.kuvaus" :is-editable="isEditing")
            .tavoitealueet
              ep-prefix-list(
                v-model="data.tavoitteet.tavoitealueet",
                arvot="tavoitteet",
                arvo="tavoite",
                :is-editable="isEditing")

          hr.valiviiva
          ep-collapse(tyyppi="laajaAlainenOsaaminen")
            h4.header(slot="header") {{ $t('laaja-alaiset-sisallot') }}
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
import { Lops2019PaikallinenOppiaineDto } from '@/tyypit';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import EpRoute from '@/mixins/EpRoute';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';
import { oppiaineValidator } from '@/validators/oppiaineet';
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
  private editable = false;
  private hooks: EditointiKontrolliConfig = {
    source: {
      save: this.save,
      load: this.load,
    },
  };

  get validator() {
    return oppiaineValidator([
      Kielet.getSisaltoKieli(),
    ]);
  }

  public async load() {
    const { paikallinenOppiaineId } = this.$route.params;
    const paikallinen = await Opetussuunnitelma.getPaikallinenOppiaine(_.parseInt(paikallinenOppiaineId));
    paikallinen.tehtava = paikallinen.tehtava || {};
    paikallinen.arviointi = paikallinen.arviointi || {};
    paikallinen.laajaAlainenOsaaminen = paikallinen.laajaAlainenOsaaminen || {};
    paikallinen.tavoitteet = paikallinen.tavoitteet || {
      tavoitealueet: [],
    };
    return paikallinen;
  }

  async save(oppiaine: Lops2019PaikallinenOppiaineDto) {
    await Opetussuunnitelma.savePaikallinenOppiaine(oppiaine);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables.scss";

.tavoitealueet {
  margin-top: 10px;
}

.header {
  user-select: none;
}

</style>
