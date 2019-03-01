<template lang="pug">
div
  ep-navigation
  .content
    h1 {{ $t('uusi-opetussuunnitelma') }}

    .form
      ep-form-content(name="nimi", ohje="uusi-ops-ohje-nimi")
        ep-input.form-control(
          id="uusi-ops-nimi",
          type="text",
          :is-editing="true",
          v-model="uusi.nimi")

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
          label(for="uusi-ops-tyyppi") {{ $t('pohja') }}
          div(v-if="pohjat")
            select.form-control(
              id="uusi-ops-ops"
              v-model="uusi.pohja")
              option(disabled value="null") {{ $t('valitse-pohja') }}
              option(v-for="pohja in pohjat" :key="pohja.id" :value="pohja")
                span {{ $kaanna(pohja.nimi) }} ({{pohja.perusteenDiaarinumero}})
            small.form-text.text-muted {{ $t('uusi-ops-ohje-pohja') }}
          ep-spinner(v-else)

      ep-organizations(v-model="uusi.organisaatiot")

      ep-button(
        @click="luoUusiOpetussuunnitelma",
        :show-spinner="isLoading") {{ $t('luo-opetussuunnitelma') }}

</template>

<script lang="ts">

import {
  EpButton,
  EpContent,
  EpFormContent,
  EpInput,
  EpNavigation,
  EpOrganizations,
  EpSpinner,
} from '@/components';

import EpRoute from '@/mixins/EpRoute';

import _ from 'lodash';
import { Component, Prop, Mixins } from 'vue-property-decorator';
import { Kielet } from '@/stores/kieli';
import { YlopsKoulutustyypit } from '@/utils/perusteet';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';

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

@Component({
  components: {
    EpButton,
    EpContent,
    EpFormContent,
    EpInput,
    EpNavigation,
    EpOrganizations,
    EpSpinner,
  },
  validations: {
    uusi: {
      nimi: {
        required,
      },
      valittuPeruste: {
        required,
      },
    },
  },
} as any)
export default class RouteOpetussuunnitelmaUusi extends Mixins(validationMixin, EpRoute) {
  private pohjat: OpetussuunnitelmaInfoDto[] | null = null;
  private oletuspohjasta: "pohjasta" | "opsista" | null = null;
  private uusi = {
    pohja: null as (OpetussuunnitelmaInfoDto | null),
    nimi: {},
    organisaatiot: {
      jarjestajat: [],
      oppilaitokset: [],
      kunnat: [],
    },
  };

  protected async init() {
    const response = await Opetussuunnitelmat.getAll('POHJA', 'VALMIS');
    this.pohjat = response.data;
  }

  public async luoUusiOpetussuunnitelma() {
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
