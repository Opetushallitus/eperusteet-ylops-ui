<template>
  <div class="content">
    <h3>{{$t('muokkaamattomat-osiot')}}</h3>

    <ep-spinner v-if="!opetussuunnitelmanTekstikappale"></ep-spinner>
    <div v-else-if="hasMuokkaamattomatTekstikappaleet">
      <b-table responsive
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
    <div v-else-if="opetussuunnitelmanTekstikappale && !hasMuokkaamattomatTekstikappaleet" class="d-flex flex-column align-items-center justify-content-center mt-4">
      <img src="../../../../public/img/images/papukaijamerkki.svg" :alt="$t('papukaijamerkki')" class="mb-4">
      <p class="text-muted">{{ $t('ei-muokkaamattomia-osia') }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';

import { TekstiKappaleDto, TekstiKappaleViiteKevytDto } from '@/tyypit';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';


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

  get hasMuokkaamattomatTekstikappaleet() {
    return !_.isEmpty(this.muokkaamattomatTekstikappaleet);
  }

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
