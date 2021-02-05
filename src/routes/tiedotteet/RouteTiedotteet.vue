<template>
  <ep-main-view :tutoriaalistore="tutoriaalistore" :container="true">
    <template slot="header">
      <div class="d-flex justify-content-between mt-5">
        <h1>{{ $t('tiedotteet') }}</h1>
        <ep-linkki
          :url="url"
          v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'pohja' }">
          <div class="d-flex">
            <span class="icon">
              <fas icon="plussa"></fas>
            </span>
            <span class="ml-2 link-text">{{ $t('lisaa-tiedote') }}</span>
          </div>
        </ep-linkki>
      </div>
    </template>
    <template>
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
        <ep-content-read-more
          v-for="tiedote in tiedotteet"
          :key="tiedote.id"
          :content="tiedote.sisalto">
          <template #preHeading>
            <p>{{ $sdt(tiedote.luotu) }}</p>
          </template>
          <template #heading>
            <h2 class="font-weight-normal">{{ $kaanna(tiedote.otsikko) }}</h2>
          </template>
        </ep-content-read-more>
        <!-- Paginaatio-->
        <div class="row" v-if="hasTiedotteet">
          <!--div.col.col-fixed-->
          <div class="col">
            <b-pagination
              class="justify-content-center"
              v-model="sivu"
              :per-page="sivukoko"
              :total-rows="kokonaismaara"
              :limit="10"
              @input="update"
              aria-controls="tiedotteet">
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
import EpContentReadMore from '@shared/components/EpContentReadMore/EpContentReadMore.vue';
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
    EpContentReadMore,
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
@import '@shared/styles/_variables.scss';
.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  width: 24px;
  border-radius: 100%;
  margin: 0;
  padding: 0;
  color: #fff;
  background-color: #3367E3;
}

.link-text {
  font-size: 1rem;
  color: $black;
}
</style>
