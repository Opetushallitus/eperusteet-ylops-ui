<template lang="pug">
div
  h1 Uusi pohja:
  br
  div
    span Nimi:
    input(type="text")
  div
    span Peruste
    b-dropdown
      template(slot="button-content")
        span Valitse peruste:
      b-dropdown-item(
        v-for="peruste in perusteLista"
        :key="id") Peruste
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Ulkopuoliset } from '@/api';
import { PerusteInfoDto } from '@/tyypit';

@Component({
  components: {
  },
})
export default class NewTemplate extends Vue {

  private perusteLista: PerusteInfoDto[] = [];

  public mounted() {
    this.fetchPerusteet();
  }

  private async fetchPerusteet() {
    const perusteet = await Ulkopuoliset.getPerusteet();
    this.perusteLista = perusteet.data;
  }

}
</script>
