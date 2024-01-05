<template>
  <div class="content">
    <h2>{{$t('muokkaamattomat-osiot')}}</h2>

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

        <template v-slot:cell(siirtyminen)>
          <EpMaterialIcon>chevron_right</EpMaterialIcon>
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
      <img src="@assets/img/images/papukaijamerkki.svg" :alt="$t('papukaijamerkki')" class="mb-4">
      <p class="text-muted">{{ $t('ei-muokkaamattomia-osia') }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { TekstiKappaleViitePerusteTekstillaDto, TekstiKappaleKevytDto } from '@shared/api/ylops';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpSpinner,
    EpMaterialIcon,
  },
})
export default class OpsMuokkaamattomatOsiot extends Vue {
  @Prop({ required: true })
  private opetussuunnitelmanTekstikappale!: TekstiKappaleViitePerusteTekstillaDto;

  private currentPage = 1;
  private perPage = 5;

  get hasMuokkaamattomatTekstikappaleet() {
    return !_.isEmpty(this.muokkaamattomatTekstikappaleet);
  }

  get muokkaamattomatTekstikappaleet() {
    return _.filter(this.kaikkiOpetussuunnitelmanTekstikappaleet, (tekstikappale) => _.eq(tekstikappale.luotu, tekstikappale.muokattu));
  }

  get kaikkiOpetussuunnitelmanTekstikappaleet(): TekstiKappaleKevytDto[] {
    if (this.opetussuunnitelmanTekstikappale) {
      return this.tekstikappaleetRecursive(this.opetussuunnitelmanTekstikappale);
    }

    return [];
  }

  tekstikappaleetRecursive(tekstikappaleItem: TekstiKappaleViitePerusteTekstillaDto) {
    let tekstikappaleet: TekstiKappaleViitePerusteTekstillaDto[] = [];

    if (tekstikappaleItem.tekstiKappale) {
      const tekstikappale = {
        ...tekstikappaleItem.tekstiKappale,
        osaId: tekstikappaleItem.id,
      };

      tekstikappaleet = [
        ...tekstikappaleet,
        tekstikappale,
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
      tdClass: 'text-right',
    }];
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
