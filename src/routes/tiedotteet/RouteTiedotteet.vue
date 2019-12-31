<template>
<ep-main-view :tutoriaalistore="tutoriaalistore">
  <template slot="icon">
    <ep-icon class="float-right" icon="tiedotteet" background-color="#000000">
    </ep-icon>
  </template>
  <template slot="header">
    <h1>{{ $t('tiedotteet') }}</h1>

    <ep-linkki url="/eperusteet-app/#/fi/admin/tiedotteet"
               v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'pohja' }">
      {{ $t('siirry-muokkaamaan-tiedotteita') }}
    </ep-linkki>

    <p>{{ $t('tiedotteet-kuvaus-nakyma') }}</p>
  </template>
  <template slot="custom-content">
    <ep-spinner v-if="isLoading">
    </ep-spinner>
    <div v-else>
      <!-- Rajaimet-->
      <div class="row">
        <div class="col">
          <ep-search class="mb-3" v-model="rajain" @input="updateSearch">
          </ep-search>
        </div>
      </div>
      <!-- Tiedotteet-->
      <div class="row" v-if="!hasTiedotteet">
        <div class="col">
          <p>{{ $t('ei-hakutuloksia') }}</p>
        </div>
      </div>
      <div class="row" v-for="tiedote in tiedotteet" :key="tiedote.id">
        <div class="col">
          <div>
            <p class="text-secondary">{{ $sd(tiedote.luotu) }}</p>
            <ep-collapse class="mb-2" :default-state="false">
              <h5 slot="header">{{ $kaanna(tiedote.otsikko) }}</h5>
              <span :class="{ preview: !tiedote.$nayta }">{{ $kaanna(tiedote.sisalto) }}</span>
            </ep-collapse>
            <hr />
          </div>
        </div>
      </div>
      <!-- Paginaatio-->
      <div class="row" v-if="hasTiedotteet">
        <!--div.col.col-fixed-->
        <div class="col">
          <b-pagination class="justify-content-center" v-model="sivu" :per-page="sivukoko" :total-rows="kokonaismaara" :limit="10" @input="update" aria-controls="tiedotteet">
          </b-pagination>
        </div>
      </div>
    </div>
  </template>
</ep-main-view>
</template>

<script lang="ts">
import { Prop, Vue, Component, Mixins } from 'vue-property-decorator';
import _ from 'lodash';

import EpButton from'@/components/EpButton/EpButton.vue';
import EpCollapse from'@/components/EpCollapse/EpCollapse.vue';
import EpContent from'@/components/EpContent/EpContent.vue';
import EpIcon from'@/components/EpIcon/EpIcon.vue';
import EpMainView from'@/components/EpMainView/EpMainView.vue';
import EpNavigation from'@/components/EpNavigation/EpNavigation.vue';
import EpRoute from '@/mixins/EpRoot';
import EpSearch from'@shared/components/forms/EpSearch.vue';
import EpSpinner from'@shared/components/EpSpinner/EpSpinner.vue';
import EpLinkki from '@shared/components/EpLinkki/EpLinkki.vue';

import { Ulkopuoliset } from '@/api';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';


@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpLinkki,
    EpButton,
    EpCollapse,
    EpContent,
    EpIcon,
    EpMainView,
    EpNavigation,
    EpSearch,
    EpSpinner,
  },
})
export default class RouteTiedotteet extends Mixins(EpRoute) {
  private rajain = '';
  private tiedotteet: any[] = [];
  private sivu = 1;
  private sivukoko = 5;
  private kokonaismaara = 0;
  private debounceUpdateSearch = _.debounce(() => {
    this.update();
  }, 300);

  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;

  async init() {
    await this.update();
  }

  private get hasTiedotteet() {
    return this.tiedotteet && this.tiedotteet.length > 0;
  }

  private updateSearch() {
    this.sivu = 1;
    this.debounceUpdateSearch();
  }

  async update() {
    const res = (await Ulkopuoliset.getTiedotteetHaku(
      this.sivu - 1,
      this.sivukoko,
      undefined, // kieli
      this.rajain, // nimi
      undefined, // perusteId
      true, // perusteeton
      true, // julkinen
      true // yleinen
    )).data as any;

    this.kokonaismaara = res.kokonaismäärä;
    this.tiedotteet = res.data;
  }
}
</script>

<style scoped lang="scss">

</style>
