<template lang="pug">

div
  ep-navigation(tyyli="ops")

  div.content
    div.container-fluid
      div.row
        div.col.col-fixed
          ep-icon.float-right(icon="tiedotteet", background-color="#000000")
        div.col
          h2 {{ $t('tiedotteet') }}
          p {{ $t('tiedotteet-kuvaus-nakyma') }}

      ep-spinner(v-if="isLoading")
      div(v-else)
        // Rajaimet
        div.row
          div.col.col-fixed
          div.col
            ep-search(v-model="rajain", @input="updateSearch")


        // Tiedotteet
        div.row(v-if="tiedotteet.length === 0")
          div.col.col-fixed.col-new
          div.col
            p {{ $t('ei-hakutuloksia') }}
        div.row(id="tiedotteet", v-for="tiedote in tiedotteet", :key="tiedote.id")
          div.col.col-fixed.col-new
            // Todo: Toteuta profiililla uusi
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

        div.row(v-if="tiedotteet.length > 0")
          div.col.col-fixed
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
import { Vue, Component, Mixins } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoot';
import { Kielet } from '@/stores/kieli';
import { delay } from '@/utils/delay';

import {
  EpAikaleima,
  EpCollapse,
  EpContent,
  EpIcon,
  EpKaanna,
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
    )).data;

    this.kokonaismaara = res.kokonaismäärä;

    this.tiedotteet = res.data;
  }
}
</script>

<style scoped lang="scss">

.col-fixed {
  flex: 0 0 100px;
}

h5 {
  overflow-x: hidden;
}

</style>
