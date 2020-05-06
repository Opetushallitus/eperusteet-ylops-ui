<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.oppiaine.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing }">

        <div v-if="data.perusteenOppiaine.tehtava">
          <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenOppiaine.tehtava" :isEditing="false" :perusteTekstiAvattu="true"/>
          <hr/>
        </div>

        <div v-if="data.perusteenVuosiluokkakokonaisuus && data.vuosiluokkakokonaisuus">

          <div v-if="data.perusteenVuosiluokkakokonaisuus.tehtava">
            <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVuosiluokkakokonaisuus.tehtava" :vlkObject="data.vuosiluokkakokonaisuus.tehtava" :isEditing="isEditing" />
            <hr/>
          </div>

          <div v-if="data.oppiaine.tyyppi === 'yhteinen' && data.vuosiluokkakokonaisuus.yleistavoitteet">
            <h4>{{ $t('tavoitteet-ja-sisallot') }}</h4>
            <ep-content v-if="isEditing || data.vuosiluokkakokonaisuus.yleistavoitteet.teksti"
                          v-model="data.vuosiluokkakokonaisuus.yleistavoitteet.teksti"
                          layout="normal"
                          :is-editable="isEditing"></ep-content>
            <ep-alert v-if="!isEditing && !data.vuosiluokkakokonaisuus.yleistavoitteet.teksti" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />
            <hr/>
          </div>

          <div v-if="!data.oppiaine.koosteinen">
            <div v-if="data.vuosiluokkakokonaisuus && data.vuosiluokkakokonaisuus.vuosiluokat.length > 0">
              <div class="d-flex justify-content-between align-items-center">
                <h3 class="mb-0">{{ $t('tavoitteet-ja-sisallot-vuosiluokittain') }}</h3>
                <router-link :to="{name:'perusopetusoppiainevuosiluokkaistaminen'}">
                  <ep-button >{{ $t('vuosiluokkaista-tavoitteet')}}</ep-button>
                </router-link>
              </div>

               <div v-for="(vuosiluokka,index) in data.vuosiluokkakokonaisuus.vuosiluokat" :key="'vuosiluokka'+index">
                <router-link :to="{name:'perusopetusoppiainevuosiluokka', params: {vlId: vuosiluokka.id}}">
                  <ep-button variant="link">{{ $t('vuosiluokka')}} {{ $t(vuosiluokka.vuosiluokka)}}</ep-button>
                </router-link>
              </div>
            </div>

            <div v-if="data.vuosiluokkakokonaisuus.vuosiluokat.length === 0">
              <div class="ei-tavoitteita mt-3 mb-3">{{ $t('tavoitteita-ei-ole-viela-vuosiluokkaistettu')}}</div>
              <router-link :to="{name:'perusopetusoppiainevuosiluokkaistaminen'}"
                  v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'opetussuunnitelma' }">
                <ep-button >{{ $t('vuosiluokkaista-tavoitteet')}}</ep-button>
              </router-link>
            </div>

            <hr/>
          </div>

          <div v-if="data.perusteenVuosiluokkakokonaisuus.tyotavat">
            <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVuosiluokkakokonaisuus.tyotavat" :vlkObject="data.vuosiluokkakokonaisuus.tyotavat" :isEditing="isEditing" />
            <hr/>
          </div>

          <div v-if="data.perusteenVuosiluokkakokonaisuus.ohjaus">
            <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVuosiluokkakokonaisuus.ohjaus" :vlkObject="data.vuosiluokkakokonaisuus.ohjaus" :isEditing="isEditing" />
            <hr/>
          </div>

          <div v-if="data.perusteenVuosiluokkakokonaisuus.arviointi">
            <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVuosiluokkakokonaisuus.arviointi" :vlkObject="data.vuosiluokkakokonaisuus.arviointi" :isEditing="isEditing" />
          </div>
        </div>
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
import VuosiluokkaSisaltoTeksti from '../VuosiluokkaSisaltoTeksti.vue';
import { PerusopetusoppiaineStore } from '@/stores/perusopetusoppiaineStore';
import { OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';

@Component({
  components: {
    EpEditointi,
    VuosiluokkaSisaltoTeksti,
    EpButton,
    EpContent,
    EpAlert,
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
