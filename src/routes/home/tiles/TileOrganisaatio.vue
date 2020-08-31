<template>
<ep-home-tile icon="ryhma" :route="{ name: 'organisaatio' }">
  <template slot="header">
    <span>{{ $t('tile-organisaatio') }}</span>
  </template>
  <template slot="content">
    <ep-spinner v-if="isLoading"></ep-spinner>
    <div v-else>
      <b-row class="mx-5 virkailijat">
        <b-col class="virkailija text-left"
               sm="6"
               v-for="virkailija in virkailijatPrewview"
               :key="virkailija.oid">
          <span>{{ virkailija.esitysnimi }}</span>
        </b-col>
      </b-row>
      <p class="mt-3 mb-0" v-if="virkailijat && virkailijat.length > previewSize">{{ $t('nayta-lisaa') }}</p>
    </div>
  </template>
</ep-home-tile>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component } from 'vue-property-decorator';
import { Kayttajat, parsiEsitysnimi } from '@/stores/kayttaja';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';

@Component({
  components: {
    EpColorIndicator,
    EpSpinner,
    EpHomeTile,
  },
})
export default class TileOrganisaatio extends Vue {
  private isLoading = true;
  private previewSize = 6;

  private get virkailijat() {
    return Kayttajat.virkailijat;
  }

  async mounted() {
    try {
      await Kayttajat.fetchOrganisaatioVirkailijat();
    }
    finally {
      this.isLoading = false;
    }
  }

  private get virkailijatFormatted() {
    return _.map(this.virkailijat, virkailija => {
      const esitysnimi = parsiEsitysnimi(virkailija);
      return {
        oid: virkailija.oid,
        esitysnimi,
      };
    });
  }

  private get virkailijatPrewview() {
    return _.take(this.virkailijatFormatted, this.previewSize);
  }
}
</script>

<style scoped lang="scss">
.virkailijat {
  .virkailija {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
}
</style>
