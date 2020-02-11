<template lang="pug">

ep-main-view(:tutoriaalistore="tutoriaalistore")
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
        //ep-color-indicator.mr-2(kind="offline")
        span {{ virkailija.esitysnimi }}

</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { Kayttajat, parsiEsitysnimi } from '@/stores/kayttaja';
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';

import EpRoute from '@/mixins/EpRoot';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';

@Component({
  components: {
    EpColorIndicator,
    EpIcon,
    EpMainView,
    EpSpinner,
  },
})
export default class RouteOrganisaatio extends Mixins(EpRoute) {

  @Prop()
  private tutoriaalistore!: TutoriaaliStore;

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
