<template lang="pug">

ep-main-view
  template(slot="icon")
    ep-icon.float-right(icon="tyoryhma", background-color="#82D4FF")

  template(slot="header")
    h1 {{ $t('organisaatio-tyoryhma') }}
    p {{ $t('organisaatio-tyoryhma-kuvaus') }}

  ep-spinner(v-if="isLoading")
  div(v-else)
    b-row.virkailijat
      b-col.virkailija.text-left(sm="6", v-for="virkailija in virkailijat", :key="virkailija.oid")
        // Todo: offline / online toiminnallisuus
        ep-color-ball.mr-2(kind="offline")
        span {{ parsiEsitysnimi(virkailija) }}

</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoot';
import { Kielet } from '@/stores/kieli';
import { Ulkopuoliset } from '@/api';
import { Kayttajat } from '@/stores/kayttaja';
import { organizations } from '@/utils/organisaatiot';
import { parsiEsitysnimi } from '@/stores/kayttaja';
import {
  EpColorBall,
  EpIcon,
  EpMainView,
  EpSpinner,
} from '@/components';

@Component({
  components: {
    EpColorBall,
    EpIcon,
    EpMainView,
    EpSpinner,
  },
})
export default class RouteOrganisaatio extends Mixins(EpRoute) {
  private virkailijat: any[] = [];

  async init() {
    const virkailijat = this.$route.params.virkailijat as any;
    if (virkailijat === undefined) {
      const orgIds = _.filter(Kayttajat.organisaatiot, oid => oid !== organizations.oph.oid);
      this.virkailijat = (await Ulkopuoliset.getOrganisaatioVirkailijat(orgIds)).data;
    }
    else {
      this.virkailijat = virkailijat;
    }
  }

  private parsiEsitysnimi(kayttaja) {
    return parsiEsitysnimi(kayttaja);
  }
}
</script>

<style scoped lang="scss">

</style>
