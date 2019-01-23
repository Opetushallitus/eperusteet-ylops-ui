<template lang="pug">
div
  h1 Uusi pohja:
  br
  div
    span {{ $t('nimi') }}:
    input(type="text")
  br
  div
    span {{ $t('peruste') }}:
    b-dropdown
      template(slot="button-content")
        span(v-if="valittuPeruste.id===-1") {{ $t('valitse-peruste') }}
        ep-content(v-if="valittuPeruste.id>=0"
          v-model="valittuPeruste.nimi")
      b-dropdown-item(
        v-for="peruste in perusteLista"
        @click="valitsePeruste(peruste)"
        :key="peruste.id"
        :disabled="peruste.id === valittuPeruste.id")
        ep-content(v-model="peruste.nimi")
        span {{ $t('diaarinumero') }}: {{peruste.diaarinumero}}
  br
  div
    button {{ $t('luo-pohja') }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Ulkopuoliset } from '@/api';
import { PerusteInfoDto } from '@/tyypit';

import EpContent from '@/components/EpContent/EpContent.vue';

@Component({
  components: {
    EpContent,
  },
})
export default class UusiPohjaRoute extends Vue {

  private perusteLista: PerusteInfoDto[] = [];
  private valittuPeruste: PerusteInfoDto = { id: -1 };

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

}
</script>
