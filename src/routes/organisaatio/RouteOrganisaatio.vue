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
      b-col.virkailija.text-left(sm="6", v-for="virkailija in virkailijatFormatted", :key="virkailija.oid")
        // Todo: offline / online toiminnallisuus
        ep-color-ball.mr-2(kind="offline")
        span {{ virkailija.esitysnimi }}

</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';
import _ from 'lodash';

import EpRoute from '@/mixins/EpRoot';
import { Ulkopuoliset } from '@/api';
import { Kayttajat, parsiEsitysnimi } from '@/stores/kayttaja';
import { organizations } from '@/utils/organisaatiot';
import EpColorBall from '@/components/EpColorBall/EpColorBall.vue';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpMainView from '@/components/EpSpinner/EpSpinner.vue';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';

@Component({
  components: {
    EpColorBall,
    EpIcon,
    EpMainView,
    EpSpinner,
  },
})
export default class RouteOrganisaatio extends Mixins(EpRoute) {
  async init() {
    await Kayttajat.updateOrganisaatioVirkailijat();
  }

  private get virkailijat() {
    return Kayttajat.virkailijat;
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
}
</script>

<style scoped lang="scss">

</style>
