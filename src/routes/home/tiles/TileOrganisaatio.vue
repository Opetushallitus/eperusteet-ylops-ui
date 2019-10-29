<template lang="pug">
base-tile(icon="tyoryhma",
    :route="{ name: 'organisaatio' }")
  template(slot="header")
    span {{ $t('tile-organisaatio') }}
  template(slot="content")
    ep-spinner(v-if="isLoading")
    div(v-else)
      b-row.mx-5.virkailijat
        b-col.virkailija.text-left(sm="6", v-for="virkailija in virkailijatPrewview", :key="virkailija.oid")
          // TODO: offline / online toiminnallisuus
          ep-color-ball.mr-2(kind="offline", :tooltip="false")
          span {{ virkailija.esitysnimi }}
      p.mt-3(v-if="virkailijat && virkailijat.length > previewSize") {{ $t('nayta-lisaa') }}

</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component } from 'vue-property-decorator';
import { Kayttajat, parsiEsitysnimi } from '@/stores/kayttaja';
import BaseTile from './BaseTile.vue';
import EpColorBall from '@/components/EpColorBall/EpColorBall.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import { organizations } from '@/utils/organisaatiot';

@Component({
  components: {
    BaseTile,
    EpColorBall,
    EpSpinner,
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
      await Kayttajat.updateOrganisaatioVirkailijat();
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
