<template>
  <div>
    <ep-navigation />
    <ep-tiedote-view :tiedotteet="tiedotteet">
      <template #search>
        <ep-search class="mb-3" v-model="rajain" @input="updateSearch" />
      </template>
      <template #pagination>
        <b-pagination
          class="justify-content-center"
          v-model="sivu"
          :per-page="sivukoko"
          :total-rows="kokonaismaara"
          :limit="10"
          @input="update"
          aria-controls="tiedotteet" />
      </template>
    </ep-tiedote-view>
  </div>
</template>

<script lang="ts">
import { Prop, Component, Mixins } from 'vue-property-decorator';
import _ from 'lodash';

import { Kielet } from '@shared/stores/kieli';
import { julkaisupaikka } from '@shared/utils/tiedote';
import { Debounced } from '@shared/utils/delay';

import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpTiedoteView from '@shared/components/EpTiedoteView/EpTiedoteView.vue';

import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpRoute from '@/mixins/EpRoot';
import { Ulkopuoliset } from '@shared/api/ylops';

@Component({
  components: {
    EpNavigation,
    EpTiedoteView,
    EpSearch,
  },
})
export default class RouteTiedotteet extends Mixins(EpRoute) {
  private rajain = '';
  private tiedotteet: any[] | null = null;
  private sivu = 1;
  private sivukoko = 10;
  private kokonaismaara = 0;

  async init() {
    await this.update();
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  @Debounced(300)
  async updateSearch() {
    this.sivu = 1;
    this.update();
  }

  async update() {
    this.tiedotteet = null;
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
