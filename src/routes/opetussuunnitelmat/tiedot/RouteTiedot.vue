<template lang="pug">

div.content
  div(v-if="hooks")
    ep-editointi(:hooks="hooks", :validator="validator")
      h2.otsikko(slot="header") {{ $t('tiedot') }}
      template(v-slot="{ data, validation, isEditing }")
        div
          .row
            .col-md-6
              ep-form-content(name="ops-nimi")
                ep-field(
                  help="ops-nimi-ohje",
                  v-model="data.nimi",
                  :validation="validation.nimi",
                  :is-editing="isEditing")
            .col-md-6
              ep-form-content(name="peruste")
                ep-field(v-model="data.perusteenDiaarinumero")
            .col-md-6
              ep-form-content(name="tila")
                ep-field(v-model="data.tila")
            .col-md-6
              ep-form-content(name="julkaisukielet")
                ep-select(
                  help="ops-julkaisukielet-ohje",
                  v-model="data.julkaisukielet",
                  :validation="validation.julkaisukielet",
                  :is-editing="isEditing",
                  :items="kielet",
                  :multiple="true")
            .col-md-6(v-if="isOps")
              ep-form-content(name="ops-hyvaksyjataho")
                ep-field(
                  help="ops-hyvaksyjataho-ohje",
                  v-model="data.hyvaksyjataho",
                  :validation="validation.hyvaksyjataho",
                  type="string",
                  :is-editing="isEditing")
            .col-md-6(v-if="isOps")
              ep-form-content(name="ops-hyvaksymispvm")
                ep-datepicker(
                  v-model="data.paatospaivamaara",
                  help="ops-hyvaksymispvm-ohje",
                  :validation="validation.paatospaivamaara",
                  :is-editing="isEditing")
            //.col-md-6(v-if="isOps")
            //  ep-form-content(name="ops-esikatseltavissa")
            //    ep-toggle(
            //      help="ops-esikatseltavissa-ohje",
            //      v-model="data.esikatseltavissa",
            //      :is-editing="isEditing")
            .col-md-12
              ep-form-content(name="ops-kuvaus")
                ep-content(
                  v-model="data.kuvaus",
                  help="ops-kuvaus-ohje",
                  :validation="validation.kuvaus",
                  :is-editable="isEditing")

        div(v-if="!isEditing && !isOps && !isValmisPohja")
          tilanvaihto(
            v-model="data.tila",
            :onSave="tryTilanvaihto",
            :is-pohja="true")

</template>

<script lang="ts">

import { EpContent, EpDatepicker, EpEditointi, EpField, EpFormContent, EpSelect, EpToggle } from '@/components';

import EpOpsRoute from '@/mixins/EpOpsRoute';

import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import _ from 'lodash';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { Component } from 'vue-property-decorator';
import { opsTiedotValidator } from '@/validators/ops';
import { Kielet } from '@/stores/kieli';

@Component({
  components: {
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpField,
    EpFormContent,
    EpSelect,
    EpToggle,
    Tilanvaihto,
  },
})
export default class RouteTiedot extends EpOpsRoute {
  private hooks: EditointiKontrolliConfig | null = null;

  async mounted() {
    this.hooks = {
      source: {
        async save(ops) {
          return Opetussuunnitelma.save(ops);
        },
        load: this.load,
      },
    };
  }

  get validator() {
    return opsTiedotValidator([
      Kielet.getSisaltoKieli(), // Validoidaan kentät sisältökielen mukaan
    ], !this.isPohja);
  }

  public async tryTilanvaihto(tila: string) {
    try {
      await Opetussuunnitelma.updateTila(tila);
      return true;
    }
    catch (err) {
      return false;
    }
  }

  private get kielet() {
    return ['fi', 'sv', 'en'];
  }

  private async load() {
    if (this.$route.params.id) {
      return Opetussuunnitelma.get(_.parseInt(this.$route.params.id));
    }
  }
}
</script>

<style scoped lang="scss" src="./style.scss"></style>
