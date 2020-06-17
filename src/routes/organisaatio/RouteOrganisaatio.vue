<template>

<ep-main-view :tutoriaalistore="tutoriaalistore">
  <template slot="icon">
    <ep-icon class="float-right" icon="tyoryhma" background-color="#82D4FF"></ep-icon>
  </template>

  <template slot="header">
    <h1>{{ $t('organisaatio-tyoryhma') }}</h1>
    <p>{{ $t('organisaatio-tyoryhma-kuvaus') }}</p>
    <ep-toggle class="float-right" v-model="showOrganizations">{{ $t('nayta-organisaatiot') }}</ep-toggle>
  </template>

  <ep-spinner v-if="isLoading" />
  <div v-else>
    <b-row class="virkailijat">
      <b-col class="virkailija text-left" sm="6" v-for="virkailija in virkailijatFormatted" :key="virkailija.oid">
        <span class="mr-2">{{ virkailija.esitysnimi }}</span>
        <ul v-if="showOrganizations">
          <li v-for="(org, idx) in virkailija.organisaatiot" :key="idx">
            {{ $kaanna(org.nimi) }}
          </li>
        </ul>
      </b-col>
    </b-row>
  </div>
</ep-main-view>
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
import EpToggle from '@shared/components/forms/EpToggle.vue';

@Component({
  components: {
    EpColorIndicator,
    EpIcon,
    EpMainView,
    EpSpinner,
    EpToggle,
  },
})
export default class RouteOrganisaatio extends Mixins(EpRoute) {
  @Prop()
  private tutoriaalistore!: TutoriaaliStore;

  private showOrganizations = false;

  async init() {
    await Kayttajat.fetchVirkailijatByOrganisaatio();
  }

  private get virkailijat() {
    return Kayttajat.virkailijat;
  }

  private get virkailijatFormatted() {
    return _.map(this.virkailijat, virkailija => {
      return {
        oid: virkailija.oid,
        esitysnimi: parsiEsitysnimi(virkailija),
        organisaatiot: virkailija.organisaatiot,
      };
    });
  }
}
</script>

<style scoped lang="scss">

</style>
