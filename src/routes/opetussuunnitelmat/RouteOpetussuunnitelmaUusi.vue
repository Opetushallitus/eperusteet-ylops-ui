<template lang="pug">
ep-main-view(:tutoriaalistore="tutoriaalistore")
  template(slot="icon")
    ep-icon.float-right(icon="luo-uusi")

  template(slot="header")
    h1 {{ $t('uusi-opetussuunnitelma') }}

  fieldset.form-group
    .row
      legend.col-form-label.col-sm-2.pt-0 {{ $t('opetussuunnitelman-pohjatyyppi') }}:
      .col-sm-10
        .form-check
          input.form-check-input(
            id="uusi-ops-pohjavalinta-1"
            type="radio",
            :value="'opsista'",
            v-model="oletuspohjasta")
          label.form-check-label(for="uusi-ops-pohjavalinta-1")
            | {{ $t('toinen-opetussuunnitelma') }}
        .form-check
          input.form-check-input(
            id="uusi-ops-pohjavalinta-2"
            type="radio",
            :value="'pohjasta'",
            v-model="oletuspohjasta",
            checked)
          label.form-check-label(for="uusi-ops-pohjavalinta-2")
            | {{ $t('oletuspohja') }}

    div(v-if="oletuspohjasta === 'opsista'")
      .alert.alert-info {{ $t('ei-opetussuunnitelmia') }}

    div(v-if="oletuspohjasta === 'pohjasta'")
      .form-group
        div(v-if="pohjat")
          ep-form-content(name="uusi-ops-pohja")
            ep-select(
              help="uusi-ops-pohja-ohje",
              v-model="uusi.pohja",
              :items="pohjat",
              :validation="$v.uusi.pohja",
              :is-editing="true")
              template(slot-scope="{ item }")
                span {{ $kaanna(item.nimi) }} ({{ item.perusteenDiaarinumero }})
        ep-spinner(v-else)

  div(v-if="oletuspohjasta")
    hr

    ep-form-content(name="nimi")
      ep-field(
        help="ops-nimi-ohje",
        v-model="uusi.nimi",
        :validation="$v.uusi.nimi",
        :is-editing="true")

    hr
    ep-organizations(
      :validation="$v.uusi.organisaatiot",
      v-model="uusi.organisaatiot")

    ep-button(
      :disabled="$v.uusi.$invalid || addingOpetussuunnitelma",
      @click="luoUusiOpetussuunnitelma",
      :show-spinner="isLoading") {{ $t('luo-opetussuunnitelma') }}

</template>

<script lang="ts">

import EpButton from '@/components/EpButton/EpButton.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpField from '@/components/forms/EpField.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpInput from '@/components/forms/EpInput.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpOrganizations from '@/components/EpOrganizations/EpOrganizations.vue';
import EpSelect from '@/components/forms/EpSelect.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';

import EpRoute from '@/mixins/EpRoute';

import _ from 'lodash';
import { Component, Prop, Mixins } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import { YlopsKoulutustyypit } from '@/utils/perusteet';
import { success } from '@/utils/notifications';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';

import {
  Ulkopuoliset,
  Opetussuunnitelmat,
} from '@/api';

import {
  OpetussuunnitelmaInfoDto,
  OpetussuunnitelmaLuontiDto,
  LokalisoituTekstiDto,
  Kieli,
} from '@/tyypit';

import { opsLuontiValidator } from '@/validators/ops';

@Component({
  components: {
    EpButton,
    EpContent,
    EpField,
    EpFormContent,
    EpIcon,
    EpInput,
    EpMainView,
    EpNavigation,
    EpOrganizations,
    EpSelect,
    EpSpinner,
  },
  validations: {
    uusi: opsLuontiValidator(),
  },
} as any)
export default class RouteOpetussuunnitelmaUusi extends Mixins(validationMixin, EpRoute) {
  private pohjat: OpetussuunnitelmaInfoDto[] | null = null;
  private oletuspohjasta: 'pohjasta' | 'opsista' | null = null;
  private addingOpetussuunnitelma = false;
  private uusi = {
    pohja: null as (OpetussuunnitelmaInfoDto | null),
    nimi: {},
    organisaatiot: {
      jarjestajat: [],
      oppilaitokset: [],
      kunnat: [],
    },
  };

  @Prop()
  private tutoriaalistore!: TutoriaaliStore;

  get steps() {
    return [{
      name: 'wizard-valitse-tyyppi',
      hide: true,
    }, {
      name: 'wizard-pohjan-valinta',
    }, {
      name: 'wizard-perustiedot',
    }, {
      name: 'wizard-lisatiedot',
    }];
  }

  protected async init() {
    const response = await Opetussuunnitelmat.getAll('POHJA', 'VALMIS');
    this.pohjat = response.data;
  }

  public async luoUusiOpetussuunnitelma() {
    this.addingOpetussuunnitelma = true;
    this.loading(async () => {
      const ops: OpetussuunnitelmaLuontiDto = {
        nimi: this.uusi.nimi,
        julkaisukielet: [],
        tyyppi: 'ops' as any,
        organisaatiot: [
          ...this.uusi.organisaatiot.jarjestajat,
          ...this.uusi.organisaatiot.oppilaitokset,
        ],
      };

      // FIXME: #swagger
      (ops as any)._pohja = '' + this.uusi.pohja!.id;
      const luotu = await Opetussuunnitelmat.addOpetussuunnitelma(ops);
      success('lisays-opetussuunnitelma-onnistui');
      this.$router.replace({
        name: 'opsTiedot',
        params: {
          id: '' + luotu.data.id,
        },
      });
    });
  }
}

</script>

<style scoped lang="scss">

@import '@/styles/_variables.scss';

</style>
