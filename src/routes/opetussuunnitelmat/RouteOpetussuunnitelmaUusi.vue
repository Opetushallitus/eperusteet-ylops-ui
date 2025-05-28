<template>
<ep-main-view>
  <template slot="header">
    <h1>{{ $t('uusi-opetussuunnitelma') }}</h1>
    <span v-html="$t('ylops-uusi-opetussuunnitelma-ohje')"/>
  </template>
  <div class="form-group">
    <ep-form-content>
      <h3 slot="header">{{$t('mita-haluat-luoda')}} *</h3>
      <b-form-group class="mt-0">
        <b-form-radio
          v-model="opetussuunnitelmaOrganisaatioTaso"
          name="uusi-ops-organisaatiotasovalinta"
          value="kunta">{{ $t('kunnan-tai-koulutuksen-jarjestajan-opetussuunnitelman') }}</b-form-radio>
        <b-form-radio
          v-model="opetussuunnitelmaOrganisaatioTaso"
          name="uusi-ops-organisaatiotasovalinta"
          value="oppilaitos">{{ $t('oppilaitoksen-opetussuunnitelman') }}</b-form-radio>
      </b-form-group>
    </ep-form-content>
    <ep-form-content name="opetussuunnitelman-pohjatyyppi-pakollinen">
      <b-form-group class="mt-0">
        <b-form-radio
          v-model="oletuspohjasta"
          @change="updateOletuspohja"
          name="uusi-ops-pohjavalinta"
          value="pohjasta">{{ $t('vain-perustetta') }}</b-form-radio>
          <b-form-radio
          v-model="oletuspohjasta"
          @change="updateOletuspohja"
          name="uusi-ops-pohjavalinta"
          value="opsista">{{ $t('toista-opetussuunnitelmaa') }}</b-form-radio>
        </b-form-group>
    </ep-form-content>
    <div v-if="oletuspohjasta">
      <div class="form-group">
        <div v-if="pohjat">
          <ep-form-content v-if="pohjat.length > 0" name="uusi-ops-pohja-pakollinen">
            <EpMultiSelect v-model="uusi.pohja"
                           track-by="id"
                           :placeholder="$t('valitse-opetussuunnitelma')"
                           :options="pohjatSortedByName"
                           :search-identity="nimiSearchIdentity"
                           :maxHeight="500"
                           :is-editing="true">
              <template slot="singleLabel" slot-scope="{ option }">
                <span>{{ $kaanna(option.nimi) }} ({{ option.perusteenDiaarinumero }})</span>
              </template>
              <template slot="option" slot-scope="{ option }">
                <span>{{ $kaanna(option.nimi) }} ({{ option.perusteenDiaarinumero }})</span>
              </template>
              <div slot="helptext" class="form-text info-box mt-2" v-if="uusi.pohja && this.oletuspohjasta !== 'pohjasta'">
                {{ $t('valittu-' + opetussuunnitelmaOrganisaatioTaso + '-' + luontityyppi.toLowerCase() + '-huomio') }}
                <template v-if="luontityyppi.toLowerCase() === 'kopio' && opetussuunnitelmaOrganisaatioTaso === 'oppilaitos'">
                  <EpSpinner class="d-inline-block" v-if="!valitunPohjanPohja" />
                  <template v-else-if="valitunPohjanPohja._pohja !== null">
                    <div class="mt-2">{{$t('valittu-opetussuunnitelma-kopio-huomio')}}</div>
                    <div class="font-weight-bold mt-2">{{$kaanna(valitunPohjanPohja.nimi)}}</div>
                  </template>
                </template>
              </div>
            </EpMultiSelect>
          </ep-form-content>
          <div v-else>
            <div class="alert alert-info">{{ $t('ei-opetussuunnitelmia') }}</div>
          </div>
        </div>
        <ep-spinner v-else></ep-spinner>
      </div>
    </div>
  </div>
  <div v-if="oletuspohjasta">
    <hr/>
    <ep-form-content name="ops-nimi-pakollinen" v-if="uusi.pohja">
      <ep-field help="ops-nimi-ohje" v-model="uusi.nimi" :validation="$v.uusi.nimi" :is-editing="true"></ep-field>
    </ep-form-content>
    <div v-if="uusi.pohja && uusi.pohja.toteutus === 'perusopetus'">
      <ep-form-content name="vuosiluokkakokonaisuudet-pakollinen">
        <EpSpinner v-if="!vuosiluokkakokonaisuudet" />
        <b-form-checkbox-group v-else v-model="uusi.vuosiluokkakokonaisuudet" class="mt-2" stacked :validation="$v.uusi.vuosiluokkakokonaisuudet">
          <b-form-checkbox v-for="(vuosiluokkakokonaisuus, index) in vuosiluokkakokonaisuudet" :key="'vlk'+index" :value="vuosiluokkakokonaisuus">
            {{ $kaanna(vuosiluokkakokonaisuus.vuosiluokkakokonaisuus.nimi) }}
          </b-form-checkbox>
        </b-form-checkbox-group>
      </ep-form-content>
    </div>
    <div v-if="uusi.pohja">
      <hr/>
      <div class="d-flex">
        <h2 class="mb-3">
          {{ $t('organisaatiot') }}
        </h2>
        <EpInfoPopover class="ml-2"><div v-html="$t('organisaatio-valinta-organisaatio-huomio')"/></EpInfoPopover>
      </div>
      <ep-organizations :validation="$v.uusi.organisaatiot"
                        :koulutustyyppi="koulutustyyppi"
                        v-model="uusi.organisaatiot">
      </ep-organizations>

      <div v-if="uusi.pohja.toteutus === 'lops2019'">
        <hr/>
        <h2 class="mb-3">{{ $t('opintojaksot') }}</h2>
        <ep-form-content :showHeader="false">
          <ep-form-content name="ops-opintojakso-tuonti-kysymys" class="no-padding">
            <b-form-group>
              <b-form-radio v-model="uusi.tuoPohjanOpintojaksot" name="opintojaksoTuonti" :value="true">{{$t('kylla')}}</b-form-radio>
              <b-form-radio v-model="uusi.tuoPohjanOpintojaksot" name="opintojaksoTuonti" :value="false">{{$t('ei')}}</b-form-radio>
            </b-form-group>
          </ep-form-content>

          <ep-form-content name="opintojaksojen-tarkistus">
            <ep-toggle v-model="uusi.ainepainoitteinen" :is-editing="true" :is-switch="false">{{$t('ainepainoitteinen')}}</ep-toggle>
          </ep-form-content>

        </ep-form-content>

        <h2 class="mb-3">{{ $t('oppimaarat') }}</h2>
        <ep-form-content name="ops-oppimaara-tuonti-kysymys" class="no-padding">
          <b-form-group>
            <b-form-radio v-model="uusi.tuoPohjanOppimaarat" name="oppimaaraTuonti" :value="true">{{$t('kylla')}}</b-form-radio>
            <b-form-radio v-model="uusi.tuoPohjanOppimaarat" name="oppimaaraTuonti" :value="false">{{$t('ei')}}</b-form-radio>
          </b-form-group>
        </ep-form-content>
      </div>

      <div class="text-right">
        <b-button class="mr-4" variant="link" :to="{ name: 'opetussuunnitelmaListaus'}">{{$t('peruuta')}}</b-button>
        <ep-button :disabled="$v.uusi.$invalid || addingOpetussuunnitelma" @click="luoUusiOpetussuunnitelma" :show-spinner="addingOpetussuunnitelma">{{ $t('luo-opetussuunnitelma') }}</ep-button>
      </div>
    </div>
  </div>
</ep-main-view>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import { success, fail } from '@/utils/notifications';
import { validationMixin } from 'vuelidate';
import { delay } from '@shared/utils/delay';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpOrganizations from '@/components/EpOrganizations/EpOrganizations.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpRoute from '@/mixins/EpRoute';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import {
  Opetussuunnitelmat,
  OpetussuunnitelmaInfoDto,
  OpetussuunnitelmaLuontiDto,
  OpetussuunnitelmaInfoDtoToteutusEnum,
  OpsVuosiluokkakokonaisuusKevytDto,
  OpsVuosiluokkakokonaisuusDto,
  OpetussuunnitelmaInfoDtoTilaEnum,
  OpetussuunnitelmaLuontiDtoLuontityyppiEnum,
  OpetussuunnitelmaNimiDto,
} from '@shared/api/ylops';
import { opsLuontiValidator, LuotavaOpsOrganisaatioTaso } from '@/validators/ops';
import { isOpsToteutusSupported } from '@/utils/opetussuunnitelmat';
import { Kielet } from '@shared/stores/kieli';

type PohjaTyyppi = 'pohjasta' | 'opsista';

@Component({
  components: {
    EpButton,
    EpField,
    EpFormContent,
    EpInput,
    EpMainView,
    EpNavigation,
    EpOrganizations,
    EpSelect,
    EpSpinner,
    EpToggle,
    EpInfoPopover,
    EpMultiSelect,
  },
  validations() {
    return {
      uusi: this.validator,
    };
  },
} as any)
export default class RouteOpetussuunnitelmaUusi extends Mixins(validationMixin, EpRoute) {
  private oletuspohjat: OpetussuunnitelmaInfoDto[] | null = null;
  private opetussuunnitelmat: OpetussuunnitelmaInfoDto[] | null = null;
  private oletuspohjasta: PohjaTyyppi | null = null;
  private opetussuunnitelmaOrganisaatioTaso: LuotavaOpsOrganisaatioTaso = 'kunta';
  private addingOpetussuunnitelma = false;
  private vuosiluokkakokonaisuudet: OpsVuosiluokkakokonaisuusKevytDto[] | null = null;
  private uusi = {
    pohja: null as (OpetussuunnitelmaInfoDto | null),
    nimi: {},
    organisaatiot: {
      jarjestajat: [],
      oppilaitokset: [],
      kunnat: [],
    },
    tuoPohjanOpintojaksot: null as (boolean | null),
    tuoPohjanOppimaarat: null as (boolean | null),
    ainepainoitteinen: false,
    vuosiluokkakokonaisuudet: [] as (OpsVuosiluokkakokonaisuusDto[]),
    luontityyppi: OpetussuunnitelmaLuontiDtoLuontityyppiEnum.VIITTEILLA,
  };
  private valitunPohjanPohja: OpetussuunnitelmaNimiDto | null = null;

  initUusi() {
    this.uusi.pohja = null;
  }

  get steps() {
    return [{
      name: 'wizard-valitse-tyyppi',
      hide: true,
    }, {
      name: 'wizard-pohjan-valinta',
    }, {
      name: 'wizard-perustiedot',
    }, {
      name: 'wizard-lisatiedot',
    }];
  }

  get koulutustyyppi() {
    return _.get(this.uusi, 'pohja.koulutustyyppi');
  }

  @Watch('uusi.pohja')
  async uusiPohjaMuutos() {
    this.uusi.organisaatiot = {
      jarjestajat: [],
      oppilaitokset: [],
      kunnat: [],
    };
    this.uusi.vuosiluokkakokonaisuudet = [];
    this.valitunPohjanPohja = null;

    if (this.uusi.pohja?.id) {
      if (this.uusi.pohja?.toteutus === OpetussuunnitelmaInfoDtoToteutusEnum.PERUSOPETUS.toLowerCase()) {
        this.vuosiluokkakokonaisuudet = null;
        const ops = (await Opetussuunnitelmat.getOpetussuunnitelmaOrganisaatiotarkistuksella(this.uusi.pohja?.id)).data;
        this.vuosiluokkakokonaisuudet = _.sortBy((ops.vuosiluokkakokonaisuudet as OpsVuosiluokkakokonaisuusKevytDto[]), [(vlk) => {
          return this.$kaanna((vlk.vuosiluokkakokonaisuus?.nimi as any));
        }]);
      }

      const pohjaOps = (await Opetussuunnitelmat.getOpetussuunnitelmaNimi(this.uusi.pohja.id)).data;
      if (pohjaOps._pohja) {
        this.valitunPohjanPohja = (await Opetussuunnitelmat.getOpetussuunnitelmaNimi(_.toNumber(pohjaOps._pohja))).data;
      }
    }
  }

  protected async init() {
    this.oletuspohjat = (await Opetussuunnitelmat.getAll('POHJA', OpetussuunnitelmaInfoDtoTilaEnum.VALMIS)).data;
    this.opetussuunnitelmat = (await Opetussuunnitelmat.getOpetussuunnitelmienOpsPohjat()).data;
  }

  get pohjatSortedByName() {
    return _.sortBy(this.pohjat, pohja => _.toLower(Kielet.kaanna(pohja.nimi)));
  }

  get pohjat() {
    if (this.oletuspohjasta === 'pohjasta') {
      return this.pohjatFilter(this.oletuspohjat);
    }
    else {
      return this.pohjatFilter(this.opetussuunnitelmat);
    }
  }

  pohjatFilter(pohjat) {
    if (!pohjat) {
      return undefined;
    }

    return _.chain(pohjat)
      .filter(pohja => pohja.tila !== OpetussuunnitelmaInfoDtoTilaEnum.POISTETTU.toLowerCase())
      .filter(pohja => isOpsToteutusSupported(pohja))
      .filter(pohja => this.opetussuunnitelmaOrganisaatioTaso !== 'kunta' || this.oletuspohjasta === 'pohjasta' || _.includes(pohja.koulutuksenjarjestaja?.tyypit, 'Kunta'))
      .value();
  }

  updateOletuspohja(value: PohjaTyyppi) {
    this.oletuspohjasta = value;
    this.initUusi();
    this.uusi.luontityyppi = OpetussuunnitelmaLuontiDtoLuontityyppiEnum.VIITTEILLA;

    if (this.oletuspohjasta === 'pohjasta') {
      this.uusi.luontityyppi = OpetussuunnitelmaLuontiDtoLuontityyppiEnum.KOPIO;
    }
  }

  nimiSearchIdentity(obj: any) {
    return _.toLower(this.$kaanna(obj.nimi));
  }

  public async luoUusiOpetussuunnitelma() {
    this.addingOpetussuunnitelma = true;
    const ops: OpetussuunnitelmaLuontiDto = {
      nimi: this.uusi.nimi,
      julkaisukielet: [],
      tyyppi: 'ops' as any,
      kunnat: this.uusi.organisaatiot.kunnat,
      organisaatiot: [
        ...this.uusi.organisaatiot.jarjestajat,
        ...this.uusi.organisaatiot.oppilaitokset,
      ],
      ainepainoitteinen: this.uusi.ainepainoitteinen,
      vuosiluokkakokonaisuudet: this.uusi.vuosiluokkakokonaisuudet,
      tuoPohjanOpintojaksot: this.uusi.tuoPohjanOpintojaksot ? this.uusi.tuoPohjanOpintojaksot : false,
      tuoPohjanOppimaarat: this.uusi.tuoPohjanOppimaarat ? this.uusi.tuoPohjanOppimaarat : false,
      luontityyppi: this.luontityyppi,
    };

    (ops as any)._pohja = '' + this.uusi.pohja!.id;
    try {
      const luotu = (await Opetussuunnitelmat.addOpetussuunnitelma(ops)).data;
      success('lisays-opetussuunnitelma-onnistui');
      this.$router.replace({
        name: 'yleisnakyma',
        params: {
          id: '' + luotu.id,
        },
      });
    }
    catch (err) {
      this.addingOpetussuunnitelma = false;
    }
  }

  get luontityyppi() {
    if (this.oletuspohjasta === 'pohjasta' || this.opetussuunnitelmaOrganisaatioTaso === 'kunta') {
      return OpetussuunnitelmaLuontiDtoLuontityyppiEnum.KOPIO;
    }

    if (this.pohjanKoulutuksenJarjestajanTyyppi === 'kunta') {
      return OpetussuunnitelmaLuontiDtoLuontityyppiEnum.VIITTEILLA;
    }
    else {
      return OpetussuunnitelmaLuontiDtoLuontityyppiEnum.KOPIO;
    }
  }

  get validator() {
    if (this.uusi && this.uusi.pohja) {
      return opsLuontiValidator([], this.uusi.pohja.toteutus, this.opetussuunnitelmaOrganisaatioTaso);
    }

    return {};
  }

  @Watch('opetussuunnitelmaOrganisaatioTaso')
  opetussuunnitelmaOrganisaatioTasoChange() {
    this.uusi.pohja = null;
  }

  get pohjanKoulutuksenJarjestajanTyyppi() {
    if (_.first(_.get(this.uusi, 'pohja.koulutuksenjarjestaja.tyypit')) === 'Oppilaitos') {
      return 'oppilaitos';
    }

    return 'kunta';
  }
}

</script>

<style scoped lang="scss">

@import '@shared/styles/_variables.scss';

  .no-padding {
    fieldset {
      margin: 0px;
      padding: 0px;
    }
  }

  .info-box {
      padding:10px 20px;
      background-color: $blue-lighten-4;
      border-radius: 0.5rem;
  }

</style>
