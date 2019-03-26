<template lang="pug">
div
  ep-navigation(tyyli="ops")

  div.content
    div.container-fluid
      // Rajaimet
      div.row
        div.col.col-fixed
          ep-icon.float-right(icon="tiedotteet", background-color="#000000")
        div.col
          h2 {{ $t('tiedotteet') }}
          p {{ $t('tiedotteet-kuvaus-nakyma') }}
          ep-search(v-model="rajain")

      // Tiedotteet
      div.row(v-for="tiedote in tiedotteetFormatted", :key="tiedote.id")
        div.col.col-fixed.col-new
          // Todo: Toteuta profiililla uusi
        div.col
          div
            p
              ep-aikaleima.text-secondary(:value="tiedote.luotu", type="sd")
            ep-collapse.mb-2(:default-state="false")
              h5(slot="header") {{ $kaanna(tiedote.otsikko) }}
              ep-content(v-model="tiedote.sisalto", :is-editable="false", :class="{ preview: !tiedote.$nayta }")
            hr
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoot';

import {
  EpAikaleima,
  EpContent,
  EpIcon,
  EpNavigation,
  EpSearch,
  EpSpinner,
  EpCollapse,
} from '@/components';
import { Ulkopuoliset } from '@/api';

@Component({
  components: {
    EpAikaleima,
    EpContent,
    EpIcon,
    EpNavigation,
    EpSearch,
    EpSpinner,
    EpCollapse,
  },
})
export default class RouteTiedotteet extends Mixins(EpRoute) {
  private rajain = '';
  private tiedotteet: any[] = [];

  private get tiedotteetFormatted() {
    return this.tiedotteet;
  }

  async mounted() {
    try {
      this.tiedotteet = _((await Ulkopuoliset.getTiedotteet()).data)
        .filter((tiedote: any) =>
          tiedote.otsikko
          && tiedote.julkinen
          && tiedote.yleinen
          && !tiedote.peruste)
        .sortBy('luotu')
        .reverse()
        .value();
    }
    finally {
    }
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
