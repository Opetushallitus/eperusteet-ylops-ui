<template lang="pug">
div
  h1 Pohjan tiedot:
  div(v-if="opsPohja")
    div
      strong {{ $t('nimi') }}:
      ep-content(v-model="opsPohja.nimi")
    div
      strong {{ $t('peruste') }}:
      div {{ opsPohja.perusteenDiaarinumero }}
    div
      strong {{ $t('julkaisukielet') }}:
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
    const key: string = 'fi';
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
