<template>
<div id="scroll-anchor" class="content">
  <ep-editointi :store="editStore" :allowSave="confirm">
    <template v-slot:header>
      <h2 class="otsikko">{{ $t('tiedot') }}</h2>
    </template>
    <template v-slot="{ data, validation, isEditing }">
      <div>
        <div class="row">
          <div class="col-md-6">
            <ep-form-content name="ops-nimi">
              <ep-field help="ops-nimi-ohje"
                        v-model="data.nimi"
                        :validation="validation.nimi" :is-editing="isEditing">
              </ep-field>
            </ep-form-content>
          </div>
          <div class="col-md-6">
            <ep-form-content name="peruste">
              <ep-external-link :url="data.perusteUrl">{{data.perusteenDiaarinumero}}</ep-external-link>
            </ep-form-content>
          </div>
          <div class="col-md-6">
            <ep-form-content name="pohjat">
              <OpsPohjat :ops="data"></OpsPohjat>
            </ep-form-content>
          </div>
          <div class="col-md-6">
            <ep-form-content name="julkaisukielet">
              <ep-select help="ops-julkaisukielet-ohje"
                          v-model="data.julkaisukielet"
                          :validation="validation.julkaisukielet"
                          :is-editing="isEditing"
                          :items="kielet"
                          :multiple="true"
                          :use-checkboxes="true">
                <template v-slot:default="{item}">
                  {{$t(item)}}
                </template>
              </ep-select>
            </ep-form-content>
          </div>
          <div class="col-md-6" v-if="isOps">
            <ep-form-content name="ops-hyvaksyjataho">
              <ep-field help="ops-hyvaksyjataho-ohje" v-model="data.hyvaksyjataho" :validation="validation.hyvaksyjataho" type="string" :is-editing="isEditing">
              </ep-field>
            </ep-form-content>
          </div>
          <div class="col-md-6" v-if="isOps">
            <ep-form-content name="ops-hyvaksymispvm">
              <ep-datepicker v-model="data.paatospaivamaara" help="ops-hyvaksymispvm-ohje" :validation="validation.paatospaivamaara" :is-editing="isEditing" :showValidValidation="false">
              </ep-datepicker>
            </ep-form-content>
          </div>

          <div class="col-md-6" v-if="isOps">
            <EpEsikatselu opetussuunnitelma v-model="storeData" :is-editing="isEditing" />
          </div>
          <div class="col-md-6">
            <ep-form-content name="ops-organisaatiot">
              <ul>
                <li v-for="(org, idx) in kunnatJaOrganisaatiotSorted" :key="idx + 1">
                  {{ $kaanna(org.nimi) }}
                </li>
              </ul>
            </ep-form-content>
          </div>
            <div class="col-md-6" v-if="hasContentFilters">
            <ep-form-content name="sisallon-tuonti" v-if="features.opintojaksot || features.oppimaarat">
              <div>
                <ep-toggle v-model="data.tuoPohjanOpintojaksot" :is-editing="isEditing" v-if="features.opintojaksot">
                  {{ $t('tuo-pohjan-organisaation-opintojaksot') }}
                </ep-toggle>
                <ep-toggle v-model="data.tuoPohjanOppimaarat" :is-editing="isEditing" v-if="features.oppimaarat">
                  {{ $t('tuo-pohjan-organisaation-oppimaarat') }}
                </ep-toggle>
              </div>
            </ep-form-content>
          </div>
            <div class="col-md-6" v-if="data.ainepainoitteinen">
            <ep-form-content name="opintojaksojen-tarkistus">
              <ep-toggle v-model="data.ainepainoitteinen" :is-editing="false" :is-switch="false">{{$t('ainepainoitteinen')}}</ep-toggle>
            </ep-form-content>
          </div>
          <div class="col-md-12">

          <div v-if="data.pohja && data.toteutus === 'perusopetus' && data.valittavatVuosiluokkakokonaisuudet">
            <ep-form-content name="vuosiluokkakokonaisuudet">
              <b-form-checkbox-group v-model="data.vuosiluokkakokonaisuudet" class="mt-2" stacked v-if="isEditing">
                <b-form-checkbox
                  v-for="(vuosiluokkakokonaisuus, index) in data.valittavatVuosiluokkakokonaisuudet"
                  :key="'vlk'+index"
                  :value="vuosiluokkakokonaisuus"
                  :disabled="vuosiluokkakokonaisuus.lukittu">
                  {{ $kaanna(vuosiluokkakokonaisuus.vuosiluokkakokonaisuus.nimi) }}
                </b-form-checkbox>
              </b-form-checkbox-group>
              <template v-else>
                <span v-for="(vuosiluokkakokonaisuus, index) in data.vuosiluokkakokonaisuudet" :key="'vlk'+index" >
                  <span v-if="index > 0">, </span>{{ $kaanna(vuosiluokkakokonaisuus.vuosiluokkakokonaisuus.nimi) }}
                </span>
              </template>
            </ep-form-content>
          </div>

          </div>
          <div class="col-md-12">
            <ep-form-content name="ops-kuvaus">
              <ep-content layout="normal"
                          v-model="data.kuvaus"
                          help="ops-kuvaus-ohje"
                          :validation="validation.kuvaus"
                          :is-editable="isEditing"> </ep-content>
            </ep-form-content>
          </div>
          <div class="col-md-6" v-if="isEditing && data.pohja" >
            <hr/>
            <h3>{{$t('organisaatiot')}}</h3>
            <ep-organizations
              :validation="validation.organisaatiot"
              :koulutustyyppi="data.koulutustyyppi"
              v-model="data.kaikkiOrganisaatiot"/>
          </div>
        </div>
      </div>
    </template>
  </ep-editointi>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Component } from 'vue-property-decorator';
import { opsTiedotValidator } from '@/validators/ops';
import { Kielet } from '@shared/stores/kieli';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import { isLukio, koulutustyyppiTheme } from '@shared/utils/perusteet';
import EpOrganizations from '@/components/EpOrganizations/EpOrganizations.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpJulkaisuLista from '@shared/components/EpJulkaisuHistoriaJulkinen/EpJulkaisuLista.vue';
import OpsPohjat from '@/routes/opetussuunnitelmat/tiedot/OpsPohjat.vue';
import EpEsikatselu from '@shared/components/EpEsikatselu/EpEsikatselu.vue';
import { OpetussuunnitelmaEditStore } from '../../../stores/OpetussuunnitelmaEditStore';

@Component({
  components: {
    OpsPohjat,
    EpJulkaisuLista,
    EpCollapse,
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpField,
    EpFormContent,
    EpSelect,
    EpToggle,
    EpExternalLink,
    EpOrganizations,
    EpMaterialIcon,
    EpEsikatselu,
  },
})
export default class RouteTiedot extends EpOpsRoute {
  private editStore: EditointiStore | null = null;

  async mounted() {
    this.editStore = new EditointiStore(new OpetussuunnitelmaEditStore(this.opsId, this.$kaanna));
  }

  get hasContentFilters() {
    return this.features.opintojaksot;
  }

  get features() {
    const koulutustyyppi = this.ops?.koulutustyyppi;
    return {
      opintojaksot: koulutustyyppi && isLukio(koulutustyyppi),
      oppimaarat: koulutustyyppi && isLukio(koulutustyyppi),
    };
  }

  private get kielet() {
    return ['fi', 'sv', 'en'];
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get kunnatJaOrganisaatiotSorted() {
    return _.sortBy(
      [
        ...(this.storeData?.kunnat ? this.storeData.kunnat : []),
        ...(this.storeData?.organisaatiot ? this.storeData.organisaatiot : []),
      ], (org: any) => this.$kaanna(org.nimi),
    );
  }

  private async confirm() {
    if (this.storeData?.toteutus === 'perusopetus') {
      const vanhatVlkTunnisteet = _.map(this.storeData?.oldVuosiluokkakokonaisuudet, opsVlk => _.get(opsVlk.vuosiluokkakokonaisuus, '_tunniste'));
      const uudetVlkTunnisteet = _.map(this.storeData?.vuosiluokkakokonaisuudet, opsVlk => _.get(opsVlk.vuosiluokkakokonaisuus, '_tunniste'));

      if (!_.every(vanhatVlkTunnisteet, vanhaTunniste => _.includes(uudetVlkTunnisteet, vanhaTunniste))) {
        return this.$bvModal.msgBoxConfirm((this.$t('vahvista-vuosiluokkakokonaisuudet-muokkaus-teksti') as any), {
          title: this.$t('vahvista-vuosiluokkakokonaisuudet-muokkaus-otsikko'),
          okVariant: 'primary',
          okTitle: this.$t('tallenna') as any,
          cancelVariant: 'link',
          cancelTitle: this.$t('peruuta') as any,
          centered: true,
          ...{} as any,
        });
      }
    }

    return true;
  }

  get storeData() {
    return this.editStore?.data.value;
  }

  set storeData(data) {
    this.editStore?.setData(data);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
.otsikko {
    margin-bottom: 0;
}
::v-deep .linkki a {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}

::v-deep .ep-collapse .header {
  color: #3367E3;
}

::v-deep .ml-auto {
  margin-left: 0 !important;
}

</style>
