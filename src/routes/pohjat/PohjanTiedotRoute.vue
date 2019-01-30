<template lang="pug">
div(class="container")

  div(class="row tab-area-row")
    div(class="col-md")
      div(class="oph-tabs")
        div(class="oph-tab-item oph-tab-item-is-active") {{ $t('pohjan-tiedot') }}
        router-link(
          :to="{ name: 'pohjanSisalto' }"
          tag="div"
          class="oph-tab-item") {{ $t('yhteiset-osuudet') }}

  div(v-if="opsPohja")
    div(class="row")
      div(class="col-md-2 text-md-right")
        strong {{ $t('nimi') }}:
      div(class="col-md-10")
        ep-content(v-model="opsPohja.nimi")
    div(class="row")
      div(class="col-md-2 text-md-right")
        strong {{ $t('peruste') }}:
      div(class="col-md-10")
        div {{ opsPohja.perusteenDiaarinumero }}
    div(class="row")
      div(class="col-md-2 text-md-right")
        strong {{ $t('julkaisukielet') }}:
      div(class="col-md-10")
        div(v-for="kieli in opsPohja.julkaisukielet") {{kieli}}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { Opetussuunnitelmat } from '@/api';
import { OpetussuunnitelmaKevytDto } from '@/tyypit';

import EpContent from '@/components/EpContent/EpContent.vue';

@Component({
  components: {
    EpContent,
  },
})
export default class PohjanTiedotRoute extends Vue {

  private opsPohja: OpetussuunnitelmaKevytDto | null = null;

  public mounted() {
    const key: string = 'id';
    if (this.$route.params.hasOwnProperty(key)) {
      const pohjaId = (this.$route.params as any)[key];
      this.haeOpsPohja( parseInt(pohjaId, 10) );
    }
  }

  private async haeOpsPohja(id: number) {
    const pohja = await Opetussuunnitelmat.get(id);
    this.opsPohja = pohja.data;
  }

}
</script>

<style scoped lang="scss" src="./style.scss"></style>