<template lang="pug">
div(class="container")
  div(class="row")
    div(class="col-md")
      h1 Uusi pohja:

  div(class="row")
    div(class="col-md-3 text-md-right")
      strong {{ $t('nimi') }}*
    div(class="col-md-9")
      input(type="text"
        v-model="perusteNimi")

  div(class="row")
    div(class="col-md-3 text-md-right")
      strong {{ $t('peruste') }}*
    div(class="col-md-9")
      b-dropdown
        template(slot="button-content")
          ep-content(
            v-if="valittuPeruste"
            v-model="valittuPeruste.nimi")
          span(v-else) {{ $t('valitse-peruste') }}
        b-dropdown-item(
          v-for="peruste in perusteLista"
          @click="valitsePeruste(peruste)"
          :key="peruste.id"
          :disabled="valittuPeruste && peruste.id === valittuPeruste.id")
          ep-content(v-model="peruste.nimi")
          span {{ $t('diaarinumero') }}: {{peruste.diaarinumero}}

  div(class="row")
    div(class="col-md-3 text-md-right")
      strong {{ $t('julkaisukielet') }}*
    div(class="col-md-9")
      input(type="checkbox"
        v-model="julkaisukielet"
        value="FI")
      label fi

  div(class="row")
    div(class="col-md-3")
    div(class="col-md-9")
      b-button(@click="luoUusiPeruste"
        :disabled="$v.$invalid") {{ $t('luo-pohja') }}
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

import { Kielet } from '@/stores/kieli';

import { Ulkopuoliset, Opetussuunnitelmat } from '@/api';

import { PerusteInfoDto,
  OpetussuunnitelmaLuontiDto,
  JulkaisukieletEnum,
  LokalisoituTekstiDto } from '@/tyypit';

import EpContent from '@/components/EpContent/EpContent.vue';

@Component({
  components: {
    EpContent,
  },
  validations: {
    perusteNimi: {
      required,
    },
    valittuPeruste: {
      required,
    },
    julkaisukielet: {
      required,
    },
  },
})
export default class UusiPohjaRoute extends Mixins(validationMixin) {

  private perusteLista: PerusteInfoDto[] = [];
  private valittuPeruste: PerusteInfoDto | null = null;
  private perusteNimi: string = '';
  private julkaisukielet: JulkaisukieletEnum[] = [];

  public mounted() {
    this.fetchPerusteet();
  }

  private async fetchPerusteet() {
    const perusteet = await Ulkopuoliset.getPerusteet();
    this.perusteLista = perusteet.data;
  }

  private valitsePeruste(peruste: PerusteInfoDto) {
    this.valittuPeruste = peruste;
  }

  private luoUusiPeruste() {
    // Don't continue, if validations fail
    if (this.$v.$invalid || this.valittuPeruste === null) {
      return;
    }

    //
    const pohjaNimi: LokalisoituTekstiDto = {
        [Kielet.getSisaltoKieli()]: this.perusteNimi,
    };

    //
    const pohja: OpetussuunnitelmaLuontiDto = {
      nimi: pohjaNimi,
      perusteenDiaarinumero: this.valittuPeruste.diaarinumero,
      julkaisukielet: this.julkaisukielet,
      tyyppi: 'pohja' as any,
    };

    //
    Opetussuunnitelmat.addOpetussuunnitelma(pohja);

  }

}
</script>
