<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi
      :store="editointiStore"
      :versionumero="versionumero"
      label-copy-confirm="oppiaine-kopiointi-varmistus-teksti"
      label-copy-topic="oppiaine-kopiointi-varmistus-otsikko"
      label-copy-confirm-button="oppiaine-kopiointi-varmistus-hyvaksynta">
      <template v-slot:kopioi-teksti>{{ $t('muokkaa') }}</template>

      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.oppiaine.nimi) }}</h2>
      </template>

      <template v-slot:additionalInfo="{ data }">
        <span v-if="data.vuosiluokkakokonaisuus && data.vuosiluokkakokonaisuus.piilotettu" class="additional-info-text">({{ $t('piilotettu')}})</span>
      </template>

      <template v-slot:info>
        <div v-if="isPohjanTyyppiOps && oppiaine.oma && !oppiaine.pohjanOppiaine">
          {{$t('oppiaine-on-kopioitu-muokattavaksi')}}
        </div>
      </template>

      <template v-slot:piilotettu>
        <div>{{$t('oavlk-on-piilotettu')}}</div>
      </template>

      <template v-slot:default="{ data, isEditing, isCopyable, validation }">

        <div v-if="!data.perusteenOppiaine" class="alert alert-danger">{{$t('ei-perustetta-info')}}</div>

        <ep-form-content :name="'oppimaaran-nimi'" v-if="isOppiaineUskontoTaiVierasKieli && isEditing">
          <ep-field
            v-model="data.oppiaine.nimi"
            :is-header="true"
            :is-editing="isEditing"
            :validation="validation.oppiaine.nimi"
            :showValidValidation="false"/>
        </ep-form-content>

        <vuosiluokka-sisalto-teksti :perusteObject="perusteenOppiaine.tehtava"
                                    :pohjaObject="pohjanOppiaine.tehtava"
                                    :vlkObject="data.oppiaine.tehtava"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />
        <hr/>

        <template v-if="perusteenOppiaine.vapaatTekstit">
          <ep-collapse tyyppi="perusteteksti"
                       :border-bottom="true"
                       :border-top="false"
                       :expanded-by-default="true"
                       v-for="(vapaateksti, index) in perusteenOppiaineVapaatTekstit"
                       :key="'perustevapaateksti' + index">

            <template v-slot:header><h4>{{$kaanna(vapaateksti.nimi)}}</h4></template>
            <span v-html="$kaanna(vapaateksti.teksti)"></span>

            <h4 class="mt-4">{{ $t('paikallinen-teksti') }}</h4>
            <EpButton v-if="isEditing && !vapaateksti.hasPaikallinenTarkennus"
                      icon="add"
                      @click="lisaaPaikallinenTarkennus(data.oppiaine, vapaateksti.id)"
                      variant="link"
                      class="mb-1">
              {{ $t('lisaa-paikallinen-tarkennus') }}
            </EpButton>
            <EpAlert v-if="!isEditing && !vapaateksti.hasPaikallinenTarkennus" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />

            <div v-for="(teksti, index) in data.oppiaine.vapaatTekstit" :key="'teksti'+index">
              <div v-if="vapaateksti.id === teksti.perusteenVapaaTekstiId">
                <EpContent v-model="teksti.paikallinenTarkennus"
                           layout="normal"
                           :is-editable="isEditing"></EpContent>

                <EpButton v-if="isEditing"
                          @click="poistaPaikallinenTarkennus(data.oppiaine, vapaateksti.id)"
                          variant="link"
                          icon="delete">
                  {{ $t('poista-paikallinen-tarkennus') }}
                </EpButton>
              </div>

            </div>
          </ep-collapse>
        </template>

        <div v-if="data.vuosiluokkakokonaisuus && perusteenVuosiluokkakokonaisuus.tehtava">
          <vuosiluokka-sisalto-teksti :perusteObject="perusteenVuosiluokkakokonaisuus.tehtava"
                                      :pohjaObject="pohjaOppiaineenVuosiluokkakokonaisuus.tehtava"
                                      :vlkObject="data.vuosiluokkakokonaisuus.tehtava"
                                      :isEditing="isEditing"
                                      :peruste-teksti-avattu="true" />
          <hr/>
        </div>

        <div v-if="data.oppiaine.tyyppi === 'yhteinen' && data.vuosiluokkakokonaisuus && data.vuosiluokkakokonaisuus.yleistavoitteet">
          <h4>{{ $t('tavoitteet-ja-sisallot') }}</h4>
          <ep-content v-if="isEditing || data.vuosiluokkakokonaisuus.yleistavoitteet.teksti"
                        v-model="data.vuosiluokkakokonaisuus.yleistavoitteet.teksti"
                        layout="normal"
                        :is-editable="isEditing"></ep-content>
          <ep-alert v-if="!isEditing && !data.vuosiluokkakokonaisuus.yleistavoitteet.teksti" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />
          <hr/>
        </div>

        <div v-if="!data.oppiaine.koosteinen && data.vuosiluokkakokonaisuus && !isCopyable">
          <div v-if="data.vuosiluokkakokonaisuus && data.vuosiluokkakokonaisuus.vuosiluokat.length > 0">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="mb-0">{{ $t('tavoitteet-ja-sisallot-vuosiluokittain') }}</h3>
              <router-link :to="{name:'perusopetusoppiainevuosiluokkaistaminen'}" v-if="!isEditing">
                <ep-button >{{ $t('vuosiluokkaista-tavoitteet')}}</ep-button>
              </router-link>
            </div>

              <div v-for="(vuosiluokka,index) in data.vuosiluokkakokonaisuus.vuosiluokat" :key="'vuosiluokka'+index">
              <router-link :to="{name:'perusopetusoppiainevuosiluokka', params: {vlId: vuosiluokka.id}}">
                <ep-button variant="link">{{ $t('vuosiluokka')}} {{ $t(vuosiluokka.vuosiluokka)}}</ep-button>
              </router-link>
            </div>

            <hr/>
          </div>

          <div v-if="data.vuosiluokkakokonaisuus.vuosiluokat.length === 0 && !isEditing">
            <div class="ei-tavoitteita mt-3 mb-3">{{ $t('tavoitteita-ei-ole-viela-vuosiluokkaistettu')}}</div>
            <router-link :to="{name:'perusopetusoppiainevuosiluokkaistaminen'}"
                v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'opetussuunnitelma' }">
              <ep-button >{{ $t('vuosiluokkaista-tavoitteet')}}</ep-button>
            </router-link>

            <hr/>
          </div>
        </div>

        <div v-if="data.vuosiluokkakokonaisuus">
          <vuosiluokka-sisalto-teksti :perusteObject="perusteenVuosiluokkakokonaisuus.tyotavat"
                                      :pohjaObject="pohjaOppiaineenVuosiluokkakokonaisuus.tyotavat"
                                      :vlkObject="data.vuosiluokkakokonaisuus.tyotavat"
                                      :isEditing="isEditing"
                                      :peruste-teksti-avattu="true" >
            <h3 slot="otsikko" v-if="!perusteenVuosiluokkakokonaisuus.tyotavat" class="mb-3">{{$t('tyotavat')}}</h3>
          </vuosiluokka-sisalto-teksti>
          <hr v-if="perusteenVuosiluokkakokonaisuus.tyotavat"/>

          <vuosiluokka-sisalto-teksti :perusteObject="perusteenVuosiluokkakokonaisuus.ohjaus"
                                      :pohjaObject="pohjaOppiaineenVuosiluokkakokonaisuus.ohjaus"
                                      :vlkObject="data.vuosiluokkakokonaisuus.ohjaus"
                                      :isEditing="isEditing"
                                      :peruste-teksti-avattu="true" >
            <h3 slot="otsikko" v-if="!perusteenVuosiluokkakokonaisuus.ohjaus" class="mb-3">{{$t('ohjaus')}}</h3>
          </vuosiluokka-sisalto-teksti>
          <hr  v-if="perusteenVuosiluokkakokonaisuus.ohjaus"/>

          <vuosiluokka-sisalto-teksti :perusteObject="perusteenVuosiluokkakokonaisuus.arviointi"
                                      :pohjaObject="pohjaOppiaineenVuosiluokkakokonaisuus.arviointi"
                                      :vlkObject="data.vuosiluokkakokonaisuus.arviointi"
                                      :isEditing="isEditing"
                                      :peruste-teksti-avattu="true" >
            <h3 slot="otsikko" v-if="!perusteenVuosiluokkakokonaisuus.arviointi" class="mb-3">{{$t('arviointi')}}</h3>
          </vuosiluokka-sisalto-teksti>
        </div>

        <div v-if="data.oppiaine.oppimaarat && data.oppiaine.oppimaarat.length > 0">

          <hr class="mt-4 mb-4"/>
          <h3 class="mb-3">{{$t('oppimaarat')}}</h3>
          <b-table striped :items="data.oppiaine.oppimaarat" :fields="oppimaaratFields">
            <template v-slot:cell(nimi)="data">
              <router-link :to="{ name: 'perusopetusoppiaine', params: {vlkId: vlkId,oppiaineId: data.item.id}}">
                {{$kaanna(data.item.nimi)}}
              </router-link>
            </template>
          </b-table>

          <ep-oppimaara-lisays
              :opetussuunnitelmaStore="store"
              :oppiaine="data.oppiaine"
              :reset-navi="resetOps"
              buttonVariant="outline"
              v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"/>
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
import VuosiluokkaSisaltoTeksti from '../VuosiluokkaSisaltoTeksti.vue';
import { PerusopetusoppiaineStore } from '@/stores/perusopetusoppiaineStore';
import { OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { isOppiaineUskontoTaiVierasKieli } from '@/utils/opetussuunnitelmat';
import EpOppimaaraLisays from '@/components/EpOppimaaraLisays/EpOppimaaraLisays.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpEditointi,
    VuosiluokkaSisaltoTeksti,
    EpButton,
    EpContent,
    EpAlert,
    EpOppimaaraLisays,
    EpFormContent,
    EpField,
    EpCollapse,
  },
})
export default class RoutePerusopetusOppiaine extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;

  async init() {
    const vuosiluokkakokonaisuus = _.head(_.filter(this.ops.vuosiluokkakokonaisuudet, vlk =>
      vlk.vuosiluokkakokonaisuus?.id === _.toNumber(this.$route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;

    const parent = _.chain(this.ops.oppiaineet)
      .map('oppiaine')
      .filter(oppiaine => !_.isEmpty(oppiaine?.oppimaarat))
      .filter(oppiaine => _.some(oppiaine?.oppimaarat, oppimaara => oppimaara.id === _.toNumber(this.$route.params.oppiaineId)))
      .head()
      .value();

    this.editointiStore = new EditointiStore(new PerusopetusoppiaineStore(
      this.opsId, _.toNumber(this.$route.params.oppiaineId), vuosiluokkakokonaisuus, _.toNumber(this.$route.query.versionumero), parent, this));
  }

  lisaaPaikallinenTarkennus(oppiaine, id) {
    if (!oppiaine.vapaatTekstit) {
      oppiaine.vapaatTekstit = [];
    }
    oppiaine.vapaatTekstit.push(
      { perusteenVapaaTekstiId: id,
        paikallinenTarkennus: Kielet.haeLokalisoituOlio(''),
      });
  }

  poistaPaikallinenTarkennus(oppiaine, vapaatekstiId) {
    oppiaine.vapaatTekstit = _.filter(oppiaine.vapaatTekstit, teksti => teksti.perusteenVapaaTekstiId !== vapaatekstiId);
  }

  get versionumero() {
    return this.$route.query.versionumero;
  }

  async resetOps() {
    await this.store.init();
  }

  get oppimaaratFields() {
    return [{
      key: 'nimi',
      thStyle: {
        display: 'none',
      },
    }];
  }

  get vlkId() {
    return this.$route.params.vlkId;
  }

  get perusteenOppiaine() {
    return this.editointiStore?.data.value.perusteenOppiaine || {};
  }

  get perusteenOppiaineVapaatTekstit() {
    return _.map(this.editointiStore?.data.value.perusteenOppiaine.vapaatTekstit || {}, pvt => {
      return {
        ...pvt,
        hasPaikallinenTarkennus: _.some(this.oppiaine.vapaatTekstit, vt => pvt.id === vt.perusteenVapaaTekstiId),
      };
    });
  }

  get pohjanOppiaine() {
    return this.editointiStore?.data.value.oppiaine.pohjanOppiaine || {};
  }

  get perusteenVuosiluokkakokonaisuus() {
    return this.editointiStore?.data.value.perusteenVuosiluokkakokonaisuus || {};
  }

  get pohjaOppiaineenVuosiluokkakokonaisuus() {
    return this.editointiStore?.data.value.pohjaOppiaineenVuosiluokkakokonaisuus || {};
  }

  get oppiaine() {
    return this.editointiStore?.data.value.oppiaine;
  }

  get oppimaaranOppiaine() {
    return _.get(
      _.find(this.ops.oppiaineet, oppiaine =>
        _.includes(_.map(oppiaine.oppiaine?.oppimaarat, 'tunniste'), this.oppiaine.tunniste)),
      'oppiaine');
  }

  get isOppiaineUskontoTaiVierasKieli() {
    if (this.oppimaaranOppiaine) {
      return isOppiaineUskontoTaiVierasKieli(this.oppimaaranOppiaine);
    }
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

.additional-info-text {
  margin-right: 10px;
  font-weight: 600;
}
</style>
