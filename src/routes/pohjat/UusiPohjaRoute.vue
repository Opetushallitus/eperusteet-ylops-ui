<template lang="pug">
div
  h1 Uusi pohja

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
        select.form-control(v-model="uusi.valittuPeruste")
          option(disabled value="null") {{ $t('valitse-peruste') }}
          option(v-for="peruste in valittavat" :key="peruste.id" :value="peruste")
            span {{ $st(peruste.nimi) }} ({{peruste.diaarinumero}})
        small.form-text.text-muted {{ $t('uusi-ops-ohje-peruste') }}
      ep-spinner(v-else)

    button.btn.btn-primary(
      @click="luoUusiPeruste"
      :disabled="$v.$invalid") {{ $t('luo-pohja') }}

  pre {{ uusi }}

</template>

<script lang="ts">
import EpContent from '@/components/EpContent/EpContent.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
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
export default class UusiPohjaRoute extends Mixins(validationMixin) {
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
      .sortBy((peruste) => (this as any).$st(peruste.nimi))
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

    //
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

      const res = await Opetussuunnitelmat.addOpetussuunnitelma(pohja);

    }
    catch (err) {
      console.log(err);
    }

  }

}
</script>
