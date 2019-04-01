<template lang="pug">
base-tile(icon="tiedotteet", color="#000", :route="{ name: 'tiedotteet' }")
  template(slot="header")
    span {{ $t('tiedotteet') }}
  template(slot="content")
    ep-spinner(v-if="isLoading")
    div(v-else)
      div.tiedotteet
        div.tiedote(v-for="tiedote in tiedotteet")
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
import { delay } from '@/utils/delay';

@Component({
  components: {
    BaseTile,
    EpSpinner,
  },
})
export default class TileTiedotteet extends Vue {
  private isLoading = true;
  private tiedotteet: any[] = [];
  private sivu = 1;
  private sivukoko = 5;

  async mounted() {
    try {
      this.tiedotteet = _((await Ulkopuoliset.getTiedotteetHaku(
        this.sivu - 1,
        this.sivukoko,
        undefined, // kieli
        undefined, // nimi
        undefined, // perusteId
        true, // perusteeton
        true, // julkinen
        true // yleinen
      )).data.data)
        .sortBy('luotu')
        .reverse()
        .value();
      console.log(this.tiedotteet);
    }
    catch (err) {
      throw err;
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
