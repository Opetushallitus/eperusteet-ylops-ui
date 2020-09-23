<template>
<ep-main-view :tutoriaalistore="tutoriaalistore">
  <template slot="icon">
    <ep-icon class="float-right" icon="tiedotteet" background-color="#000000">
    </ep-icon>
  </template>
  <template slot="header">
    <h1>{{ $t('tiedotteet') }}</h1>

    <ep-linkki v-if="url"
               :url="url"
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
      <div class="row mt-3" v-for="(tiedote, idx) in tiedotteet" :key="tiedote.id">
        <div class="col">
          <div>
            <p class="text-secondary m-0">{{ $sd(tiedote.luotu) }}</p>
            <ep-collapse class="mb-2" :default-state="false" :border-bottom="!(idx === tiedotteet.length - 1)" :use-padding="false">
              <div slot="header"><h2>{{ $kaanna(tiedote.otsikko) }}</h2></div>
              <div v-if="$kaanna(tiedote.sisalto)" v-html="$kaanna(tiedote.sisalto)"></div>
            </ep-collapse>
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

import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import { Kielet } from '@shared/stores/kieli';
import { julkaisupaikka } from '@shared/utils/tiedote';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpRoute from '@/mixins/EpRoot';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpLinkki from '@shared/components/EpLinkki/EpLinkki.vue';
import { Ulkopuoliset } from '@shared/api/ylops';

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

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get url() {
    return `/eperusteet-app/uusi/#/${this.kieli}/tiedotteet`;
  }

  private get hasTiedotteet() {
    return this.tiedotteet && this.tiedotteet.length > 0;
  }

  private updateSearch() {
    this.sivu = 1;
    this.debounceUpdateSearch();
  }

  async update() {
    const tiedotteetHaku = ((await Ulkopuoliset.getTiedotteetHaku(
      this.sivu - 1,
      this.sivukoko,
      [_.toUpper(this.kieli)],
      this.rajain,
      undefined,
      undefined,
      undefined,
      undefined,
      [julkaisupaikka.ops, julkaisupaikka.lops],
    )).data as any);
    this.tiedotteet = tiedotteetHaku.data;
    this.kokonaismaara = tiedotteetHaku.kokonaismäärä;
  }
}
</script>

<style scoped lang="scss">
h2 {
  font-size: 1rem;
  font-weight: 500;
}
</style>
