<template lang="pug">
div
  h1 {{ $t('uusi-pohja') }}

  .form
    .form-group
      label(for="uusi-ops-nimi") {{ $t('nimi') }}
      input.form-control(
        id="uusi-ops-nimi"
        type="text"
        v-model="uusi.nimi")
      small.form-text.text-muted {{ $t('uusi-ops-ohje-nimi') }}

    .form-group
      label(for="uusi-ops-tyyppi") {{ $t('peruste') }}
      div(v-if="valittavat.length > 0")
        select.form-control(
          id="uusi-ops-peruste"
          v-model="uusi.valittuPeruste")
          option(disabled value="null") {{ $t('valitse-peruste') }}
          option(v-for="peruste in valittavat" :key="peruste.id" :value="peruste")
            span {{ $kaanna(peruste.nimi) }} ({{peruste.diaarinumero}})
        small.form-text.text-muted {{ $t('uusi-ops-ohje-peruste') }}
      ep-spinner(v-else)

    ep-button(
      @click="luoUusiPeruste"
      :disabled="$v.$invalid || isSaving"
      :show-spinner="isSaving") {{ $t('luo-pohja') }}

</template>

<script lang="ts">
import EpContent from '@/components/EpContent/EpContent.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpButton from '@/components/EpButton/EpButton.vue';
import _ from 'lodash';
import { Component, Prop, Mixins } from 'vue-property-decorator';
import { Kielet } from '@/stores/kieli';
import { Ulkopuoliset, Opetussuunnitelmat } from '@/api';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { YlopsKoulutustyypit } from '@/utils/perusteet';
import {
  PerusteInfoDto,
  OpetussuunnitelmaLuontiDto,
  LokalisoituTekstiDto,
  Kieli,
} from '@/tyypit';

@Component({
  components: {
    EpContent,
    EpSpinner,
    EpButton,
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
export default class RoutePohjaUusi extends Mixins(validationMixin) {
  private isSaving = false;
  private perusteet: PerusteInfoDto[] = [];
  private uusi = {
    valittuPeruste: null as (PerusteInfoDto | null),
    nimi: '',
  };

  public async mounted() {
    this.perusteet = (await Ulkopuoliset.getPerusteet()).data;
  }

  private get valittavat() {
    return _(this.perusteet)
      .filter((peruste) => _.includes(YlopsKoulutustyypit, peruste.koulutustyyppi))
      .sortBy((peruste) => (this as any).$kaanna(peruste.nimi))
      .value();
  }

  private valitsePeruste(peruste: PerusteInfoDto) {
    this.uusi.valittuPeruste = peruste;
  }

  private async luoUusiPeruste() {
    // Don't continue, if validations fail
    if ((this as any).$v.$invalid || this.uusi.valittuPeruste === null) {
      return;
    }

    this.isSaving = true;

    const pohjaNimi: LokalisoituTekstiDto = {
        [Kielet.getSisaltoKieli()]: this.uusi.nimi,
    };

    //
    try {
      const pohja: OpetussuunnitelmaLuontiDto = {
        nimi: {
          fi: this.uusi.nimi,
        } as any,
        perusteenDiaarinumero: this.uusi.valittuPeruste.diaarinumero,
        julkaisukielet: [Kieli.fi, Kieli.sv] as any,
        tyyppi: 'pohja' as any,
      };

      const data = (await Opetussuunnitelmat.addOpetussuunnitelma(pohja)).data;
      if (_.isNumber(data.id)) {
        this.$router.replace({
          name: 'opsTiedot',
          params: {
            id: '' + data.id,
          },
        });
      }

    }
    catch (err) {
      console.log(err);
      this.isSaving = false;
    }

  }

}
</script>
