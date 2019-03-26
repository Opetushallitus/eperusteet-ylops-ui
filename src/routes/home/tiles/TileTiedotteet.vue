<template lang="pug">
base-tile(icon="tiedotteet", color="#000", :route="{ name: 'tiedotteet' }")
  template(slot="header")
    span {{ $t('tiedotteet') }}
  template(slot="content")
    ep-spinner(v-if="isLoading")
    div(v-else)
      .tiedotteet
        div.tiedote(v-for="tiedote in uusimmat")
          small.mr-4 {{ $cdt(tiedote.luotu, 'L') }}
          span {{ $kaanna(tiedote.otsikko) }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';
import { Ulkopuoliset } from '@/api';
import {
  EpSpinner,
} from '@/components';
import _ from 'lodash';


@Component({
  components: {
    BaseTile,
    EpSpinner,
  },
})
export default class TileTiedotteet extends Vue {
  private isLoading = true;
  private tiedotteet: any[] = [];
  private tiedotteetCount = 5;

  get uusimmat() {
    return _.take(this.tiedotteet, this.tiedotteetCount);
  }

  async mounted() {
    try {
      this.tiedotteet = _((await Ulkopuoliset.getTiedotteetHaku(
        1,
        this.tiedotteetCount,
        undefined,
        undefined,
        undefined,
        true,
        true

        /*{
        sivu: 1,
        sivukoko: this.tiedotteetCount,
        julkinen: true,
        yleinen: true
      }*/
      )).data.data)
        /*.filter((tiedote: any) =>
          tiedote.otsikko
          && tiedote.julkinen
          && tiedote.yleinen
          && !tiedote.peruste)*/
        .sortBy('luotu')
        .reverse()
        .value();
    }
    finally {
      this.isLoading = false;
    }
  }
}
</script>

<style scoped lang="scss">
.tiedotteet {
  text-align: left;

  .tiedote {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;

    small {
      color: #071A58;
    }
  }

}

</style>
