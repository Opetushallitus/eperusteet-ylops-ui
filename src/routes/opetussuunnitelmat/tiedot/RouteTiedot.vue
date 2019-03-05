import {Kieli} from "../../../tyypit";
<template lang="pug">

div.content
  h2 {{ $t('tiedot') }}
  div(v-if="hooks")
    ep-editointi(:hooks="hooks", :validator="validator")
      template(v-slot="{ data, validation, isEditing }")
        div
          .row
            .col-md-6
              ep-field(
                name="ops-nimi",
                v-model="data.nimi",
                help="ops-nimi-ohje",
                :validation="validation.nimi",
                :is-editing="isEditing")
            .col-md-6
              ep-field(
                name="peruste",
                v-model="data.perusteenDiaarinumero")
            .col-md-6
              ep-field(
                name="tila",
                v-model="data.tila")
            .col-md-6
              ep-form-content(
                name="julkaisukielet",
                ohje="ops-julkaisukielet-ohje")
                ep-select(
                  name="julkaisukielet",
                  :is-editing="isEditing",
                  :items="kielet",
                  v-model="data.julkaisukielet",
                  :multiple="true")
            .col-md-6(v-if="isOps")
              ep-field(
                name="ops-hyvaksyjataho",
                v-model="data.hyvaksyjataho",
                :is-string="true",
                help="ops-hyvaksyjataho-ohje",
                :is-editing="isEditing")
            .col-md-6(v-if="isOps")
              ep-form-content(
                name="ops-hyvaksymispvm",
                help="ops-hyvaksymispvm-ohje",
                :is-editing="isEditing")
                ep-datepicker(
                  v-model="data.paatospaivamaara",
                  :validation="validation.paatospaivamaara",
                  :is-editing="isEditing")
            .col-md-6(v-if="isOps")
              ep-toggle(
                name="ops-esikatseltavissa",
                v-model="data.esikatseltavissa",
                help="ops-esikatseltavissa-ohje",
                :is-editing="isEditing")
            .col-md-12
              ep-form-content(name="ops-kuvaus", ohje="ops-kuvaus-ohje")
                ep-content(v-model="data.kuvaus", :is-editable="isEditing")
        div(v-if="!isEditing")
          tilanvaihto(v-model="data.tila", :onSave="tryTilanvaihto")

</template>


<script lang="ts">

  import { EpContent, EpDatepicker, EpEditointi, EpField, EpFormContent, EpSelect, EpToggle, } from "@/components";

  import EpOpsRoute from "@/mixins/EpOpsRoute";

  import Tilanvaihto from "@/routes/opetussuunnitelmat/Tilanvaihto.vue";
  import _ from "lodash";
  import { EditointiKontrolliConfig } from "@/stores/editointi";
  import { Opetussuunnitelma } from "@/stores/opetussuunnitelma";
  import { Component } from "vue-property-decorator";
  import { opsTiedotValidator } from "@/validators/ops";
  import { Kieli } from '@/tyypit';

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
    return opsTiedotValidator([Kieli.fi]);
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
