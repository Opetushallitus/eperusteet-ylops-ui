<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.oppiaine.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing }">
        <vuosiluokkakokonaisuus-sisalto-teksti :perusteObject="data.perusteenOppiaine.tehtava" :isEditing="false" :perusteTekstiAvattu="true"/>

        <hr/>
        <vuosiluokkakokonaisuus-sisalto-teksti :perusteObject="data.perusteenVuosiluokkakokonaisuus.tehtava" :vlkObject="data.vuosiluokkakokonaisuus.tehtava" :isEditing="isEditing" />

        <hr/>
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="mb-0">{{ $t('tavoitteet-ja-sisallot-vuosiluokittain') }}</h3>
          <router-link v-if="data.vuosiluokkakokonaisuus.vuosiluokat.length > 0" :to="{name:'perusopetusoppiainevuosiluokkaistaminen'}">
            <ep-button >{{ $t('vuosiluokkaista-tavoitteet')}}</ep-button>
          </router-link>
        </div>

        <div v-if="data.vuosiluokkakokonaisuus.vuosiluokat.length === 0">
          <div class="ei-tavoitteita mt-3 mb-3">{{ $t('tavoitteita-ei-ole-viela-vuosiluokkaistettu')}}</div>
          <router-link :to="{name:'perusopetusoppiainevuosiluokkaistaminen'}">
            <ep-button >{{ $t('vuosiluokkaista-tavoitteet')}}</ep-button>
          </router-link>
        </div>

        <div v-else v-for="(vuosiluokka,index) in data.vuosiluokkakokonaisuus.vuosiluokat" :key="'vuosiluokka'+index">
          <router-link :to="{name:''}">
            <ep-button variant="link">{{ $t('vuosiluokka')}} {{ $t(vuosiluokka.vuosiluokka)}}</ep-button>
          </router-link>
        </div>

        <hr/>
        <vuosiluokkakokonaisuus-sisalto-teksti :perusteObject="data.perusteenVuosiluokkakokonaisuus.tyotavat" :vlkObject="data.vuosiluokkakokonaisuus.tyotavat" :isEditing="isEditing" />

        <hr/>
        <vuosiluokkakokonaisuus-sisalto-teksti :perusteObject="data.perusteenVuosiluokkakokonaisuus.ohjaus" :vlkObject="data.vuosiluokkakokonaisuus.ohjaus" :isEditing="isEditing" />

        <hr/>
        <vuosiluokkakokonaisuus-sisalto-teksti :perusteObject="data.perusteenVuosiluokkakokonaisuus.arviointi" :vlkObject="data.vuosiluokkakokonaisuus.arviointi" :isEditing="isEditing" />

        </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { VuosiluokkakokonaisuusStore } from '@/stores/vuosiluokkakokonaisuusStore';
import VuosiluokkakokonaisuusSisaltoTeksti from '../VuosiluokkakokonaisuusSisaltoTeksti.vue';
import { PerusopetusoppiaineStore } from '@/stores/perusopetusoppiaineStore';
import { OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpEditointi,
    VuosiluokkakokonaisuusSisaltoTeksti,
    EpButton,
  },
})
export default class RoutePerusopetusOppiaine extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;

  async init() {
    const vuosiluokkakokonaisuus = _.head(_.filter(this.ops.vuosiluokkakokonaisuudet, vlk =>
      vlk.vuosiluokkakokonaisuus?.id === _.toNumber(this.$route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;

    this.editointiStore = new EditointiStore(new PerusopetusoppiaineStore(
      this.opsId, _.toNumber(this.$route.params.oppiaineId), vuosiluokkakokonaisuus));
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .ei-tavoitteita {
    font-size: 0.85rem;
    font-style: italic;
    color: $gray-lighten-2;
  }

</style>
