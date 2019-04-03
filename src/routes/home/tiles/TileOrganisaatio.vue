<template lang="pug">
base-tile(icon="tyoryhma",
    color="#82D4FF",
    :route="{ name: 'organisaatio', params: { virkailijat: virkailijat } }")
  template(slot="header")
    span {{ $t('tile-organisaatio') }}
  template(slot="content")
    // Todo: Järkevä kuvaus
    //p {{ $t('tile-organisaatio-kuvaus') }}
    ep-spinner(v-if="isLoading")
    div(v-else)
      b-row.mx-5.virkailijat
        b-col.virkailija.text-left(sm="6", v-for="virkailija in virkailijatPrewview", :key="virkailija.oid")
          // Todo: offline / online toiminnallisuus
          ep-color-ball.mr-2(kind="offline")
          span {{ parsiEsitysnimi(virkailija) }}
      p.mt-3(v-if="virkailijat && virkailijat.length > previewSize") {{ $t('nayta-lisaa') }}

</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component } from 'vue-property-decorator';
import { Ulkopuoliset } from '@/api';
import { Kayttajat, parsiEsitysnimi } from '@/stores/kayttaja';
import BaseTile from './BaseTile.vue';
import {
  EpColorBall,
  EpSpinner,
} from '@/components';
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
  private virkailijat: any[] = [];
  private previewSize = 100;

  async mounted() {
    try {
      const orgIds = _.filter(Kayttajat.organisaatiot, oid => oid !== organizations.oph.oid);
      this.virkailijat = (await Ulkopuoliset.getOrganisaatioVirkailijat(orgIds)).data;
    }
    finally {
      this.isLoading = false;
    }
  }

  private get virkailijatPrewview() {
    return _.take(this.virkailijat, this.previewSize);
  }

  private parsiEsitysnimi(kayttaja) {
    return parsiEsitysnimi(kayttaja);
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
