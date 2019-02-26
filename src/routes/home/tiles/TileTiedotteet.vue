<template lang="pug">
base-tile
  template(slot="icon")
    fas(icon="bell")
  template(slot="header")
    span {{ $t('tile-tiedotteet') }}
  template(slot="content")
    ep-spinner(v-if="isLoading")
    .tiedotteet
      .tiedote(v-for="tiedote in uusimmat")
        a(href="")
          ep-content(:value="tiedote.otsikko")
        // pre {{ tiedote }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';
import { Ulkopuoliset } from '@/api';
import { YlopsKoulutustyypit } from '@/utils/perusteet';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import _ from 'lodash';

@Component({
  components: {
    BaseTile,
    EpContent,
    EpSpinner,
  }
})
export default class TileTiedotteet extends Vue {
  private isLoading = true;
  private tiedotteet: any[] = [];

  get uusimmat() {
    return _.take(this.tiedotteet, 5);
  }

  async mounted() {
    try {
      this.tiedotteet = _((await Ulkopuoliset.getTiedotteet()).data)
        .filter((tiedote: any) =>
          tiedote.otsikko
          && tiedote.julkinen
          && tiedote.yleinen
          && !tiedote.peruste)
          // && _.includes(YlopsKoulutustyypit, tiedote.peruste.koulutustyyppi))
        // .filter((tiedote: any) => tiedote.peruste.koulutu)
        .sortBy('luotu')
        .reverse()
        .value();
    }
    catch (err) {
    }
    finally {
      this.isLoading = false;
    }
  }
}
</script>

<style scoped lang="scss">
.tiedote {
  padding-top: 10px;
}
</style>