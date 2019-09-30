<template lang="pug">

ep-main-view
  template(slot="icon")
    ep-icon.float-right(icon="tiedotteet", background-color="#000000")

  template(slot="header")
    h2 {{ $t('tiedotteet') }}
    p {{ $t('tiedotteet-kuvaus-nakyma') }}

  template(slot="custom-content")
    ep-spinner(v-if="isLoading")
    div(v-else)
      // Rajaimet
      div.row
        //div.col.col-fixed
        div.col
          ep-search(v-model="rajain", @input="updateSearch")
      // Tiedotteet
      div.row(v-if="!hasTiedotteet")
        //div.col.col-fixed.col-new
        div.col
          p {{ $t('ei-hakutuloksia') }}
      div.row(v-for="tiedote in tiedotteet", :key="tiedote.id")
        //div.col.col-fixed
          // Todo: Toteuta profiililla uusi
        // Todo: Toteuta paikalliset tiedotteet!
        div.col
          div
            p
              ep-aikaleima.text-secondary(:value="tiedote.luotu", type="sd")
            ep-collapse.mb-2(:default-state="false")
              h5(slot="header")
                ep-kaanna(:value="tiedote.otsikko")
                  // Piilotetaan valitsin
                  div
              ep-kaanna(:value="tiedote.sisalto", :class="{ preview: !tiedote.$nayta }")
            hr
      // Paginaatio
      div.row(v-if="hasTiedotteet")
        //div.col.col-fixed
        div.col
          b-pagination.justify-content-center(
            v-model="sivu",
            :per-page="sivukoko",
            :total-rows="kokonaismaara",
            :limit="10",
            @input="update",
            aria-controls="tiedotteet")

</template>

<script lang="ts">
import { Prop, Vue, Component, Mixins } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoot';

import {
  EpAikaleima,
  EpCollapse,
  EpContent,
  EpIcon,
  EpKaanna,
  EpMainView,
  EpNavigation,
  EpSearch,
  EpSpinner,
} from '@/components';
import { Ulkopuoliset } from '@/api';

@Component({
  components: {
    EpAikaleima,
    EpCollapse,
    EpContent,
    EpIcon,
    EpKaanna,
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
