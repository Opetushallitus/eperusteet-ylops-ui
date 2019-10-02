<template>
<div class="content">
  <div v-if="hooks">
    <ep-editointi :hooks="hooks" :validator="validator">
      <h2 class="otsikko" slot="header">{{ $t('tiedot') }}</h2>
      <template v-slot="{ data, validation, isEditing }">
        <div>
          <div class="row">
            <div class="col-md-6">
              <ep-form-content name="ops-nimi">
                <ep-field help="ops-nimi-ohje" v-model="data.nimi" :validation="validation.nimi" :is-editing="isEditing">
                </ep-field>
              </ep-form-content>
            </div>
            <div class="col-md-6">
              <ep-form-content name="peruste">
                <ep-field v-model="data.perusteenDiaarinumero">
                </ep-field>
              </ep-form-content>
            </div>
            <div class="col-md-6">
              <ep-form-content name="tila">
                <ep-field v-model="data.tila">
                </ep-field>
              </ep-form-content>
            </div>
            <div class="col-md-6">
              <ep-form-content name="julkaisukielet">
                <ep-select help="ops-julkaisukielet-ohje" v-model="data.julkaisukielet" :validation="validation.julkaisukielet" :is-editing="isEditing" :items="kielet" :multiple="true">
                </ep-select>
              </ep-form-content>
            </div>
            <div class="col-md-6" v-if="isOps">
              <ep-form-content name="ops-hyvaksyjataho">
                <ep-field help="ops-hyvaksyjataho-ohje" v-model="data.hyvaksyjataho" :validation="validation.hyvaksyjataho" type="string" :is-editing="isEditing">
                </ep-field>
              </ep-form-content>
            </div>
            <div class="col-md-6" v-if="isOps">
              <ep-form-content name="ops-hyvaksymispvm">
                <ep-datepicker v-model="data.paatospaivamaara" help="ops-hyvaksymispvm-ohje" :validation="validation.paatospaivamaara" :is-editing="isEditing">
                </ep-datepicker>
              </ep-form-content>
            </div>
            <div class="col-md-6" v-if="isOps">
              <ep-form-content name="ops-esikatseltavissa">
                <ep-toggle help="ops-esikatseltavissa-ohje" v-model="data.esikatseltavissa" :is-editing="isEditing"></ep-toggle>
              </ep-form-content>
            </div>
            <div class="col-md-12">
              <ep-form-content name="ops-kuvaus">
                <ep-content layout="normal" :opetussuunnitelma-store="opetussuunnitelmaStore" v-model="data.kuvaus" help="ops-kuvaus-ohje" :validation="validation.kuvaus" :is-editable="isEditing"> </ep-content>
              </ep-form-content>
            </div>
          </div>
        </div>
        <div v-if="!isEditing && !isOps && !isValmisPohja">
          <tilanvaihto v-model="data.tila" :onSave="tryTilanvaihto" :is-pohja="true">
          </tilanvaihto>
        </div>
      </template>
    </ep-editointi>
  </div>
</div>
</template>

<script lang="ts">

import { EpContent, EpDatepicker, EpEditointi, EpField, EpFormContent, EpSelect, EpToggle } from '@/components';

import EpOpsRoute from '@/mixins/EpOpsRoute';

import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import _ from 'lodash';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { Prop, Component } from 'vue-property-decorator';
import { opsTiedotValidator } from '@/validators/ops';
import { Kielet } from '@/stores/kieli';
import EpProgress from '@/components/EpProgress.vue';


@Component({
  components: {
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpField,
    EpFormContent,
    EpProgress,
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
        save: this.store.save,
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
      await this.store.updateTila(tila);
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
      return this.store.get();
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";
.otsikko {
    margin-bottom: 0;
}
</style>
