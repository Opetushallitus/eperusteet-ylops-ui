<template>
  <div class="content">
    <h3>{{$t('muokkaamattomat-osiot')}}</h3>

    <b-table
      borderless
      striped
      :items="muokkaamattomatTekstikappaleet"
      :fields="fields"
      :current-page="currentPage"
      :per-page="perPage">

      <template v-slot:cell(nimi)="data">
        <router-link tag="a" :to="{ name: 'tekstikappale', params: { osaId: data.item.osaId } }" :key="data.item.osaId">
           {{ $kaanna(data.value) }}
        </router-link>
      </template>

      <template v-slot:cell(siirtyminen)="data">
        <fas icon="vakanen-oikea" />
      </template>

    </b-table>

    <b-pagination
      v-model="currentPage"
      :total-rows="muokkaamattomatTekstikappaleet.length"
      :per-page="perPage"
      aria-controls="arkistoidut-opetussuunnitelmat"
      align="center">
    </b-pagination>
  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { OpetussuunnitelmaKevytDto, TekstiKappaleDto, TekstiKappaleViiteKevytDto } from '@/tyypit';

@Component({
  components:{
    EpSpinner,
  }
})
export default class OpsMuokkaamattomatOsiot extends Vue {

  @Prop({required: true})
  private opetussuunnitelmanTekstikappale!: TekstiKappaleDto;

  private currentPage = 1;
  private perPage = 5;

  get muokkaamattomatTekstikappaleet() {
    return _.filter(this.kaikkiOpetussuunnitelmanTekstikappaleet, (tekstikappale) => _.eq(tekstikappale.luotu, tekstikappale.muokattu));
  }

  get kaikkiOpetussuunnitelmanTekstikappaleet(): TekstiKappaleDto[] {
    if (this.opetussuunnitelmanTekstikappale) {
      return this.tekstikappaleetRecursive(this.opetussuunnitelmanTekstikappale);
    }

    return [];
  }

  tekstikappaleetRecursive(tekstikappaleItem: TekstiKappaleViiteKevytDto) {
    let tekstikappaleet: TekstiKappaleViiteKevytDto[] = [];

    if (tekstikappaleItem.tekstiKappale) {
      const tekstikappale = {
        ...tekstikappaleItem.tekstiKappale,
        osaId: tekstikappaleItem.id,
      };

      tekstikappaleet = [
        ...tekstikappaleet,
        tekstikappale
      ];
    }

    if (tekstikappaleItem.lapset) {
      tekstikappaleet = [
        ...tekstikappaleet,
        ..._.chain(tekstikappaleItem.lapset)
          .map((lapsi) => this.tekstikappaleetRecursive(lapsi))
          .flatten()
          .value(),
      ];
    }

    return tekstikappaleet;
  }

  get fields() {
    return [{
      key: 'nimi',
      label: '',
    }, {
      key: 'siirtyminen',
      label: '',
      tdClass: 'text-right'
    }];
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

</style>
