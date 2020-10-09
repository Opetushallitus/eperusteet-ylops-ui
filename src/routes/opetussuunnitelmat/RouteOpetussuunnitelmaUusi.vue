<template>
<ep-main-view :tutoriaalistore="tutoriaalistore">
  <template slot="icon">
    <ep-icon class="float-right" icon="luo-uusi"></ep-icon>
  </template>
  <template slot="header">
    <h1>{{ $t('uusi-opetussuunnitelma') }}</h1>
    <p>{{ $t('uusi-opetussuunnitelma-ohje') }}</p>
  </template>
  <div class="form-group">
    <div class="row">
      <legend class="col-form-label col-sm-2">{{ $t('opetussuunnitelman-pohjatyyppi-pakollinen') }}</legend>
      <div class="col-sm-10 mb-4">
        <b-form-group class="mt-0">
          <b-form-radio
            v-model="oletuspohjasta"
            @change="updateOletuspohja"
            name="uusi-ops-pohjavalinta"
            value="opsista">{{ $t('toinen-opetussuunnitelma') }}</b-form-radio>
          <b-form-radio
            v-model="oletuspohjasta"
            @change="updateOletuspohja"
            name="uusi-ops-pohjavalinta"
            value="pohjasta">{{ $t('oletuspohja') }}</b-form-radio>
        </b-form-group>
      </div>
    </div>
    <div v-if="oletuspohjasta">
      <div class="form-group">
        <div v-if="pohjat">
          <ep-form-content v-if="pohjat.length > 0" name="uusi-ops-pohja-pakollinen">
            <ep-select v-model="uusi.pohja"
                       :items="pohjatSortedByName"
                       :validation="$v.uusi.pohja"
                       :is-editing="true"
                       help="uusi-ops-pohja-ohje"
                       placeholder="valitse-opetussuunnitelman-pohja">
              <template slot-scope="{ item }">
                <span>{{ $kaanna(item.nimi) }} ({{ item.perusteenDiaarinumero }})</span>
              </template>
            </ep-select>
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

    <div v-if="uusi.pohja && uusi.pohja.toteutus === 'perusopetus' && vuosiluokkakokonaisuudet">
      <ep-form-content name="vuosiluokkakokonaisuudet-pakollinen">
        <b-form-checkbox-group v-model="uusi.vuosiluokkakokonaisuudet" class="mt-2" stacked :validation="$v.uusi.vuosiluokkakokonaisuudet">
          <b-form-checkbox v-for="(vuosiluokkakokonaisuus, index) in vuosiluokkakokonaisuudet" :key="'vlk'+index" :value="vuosiluokkakokonaisuus">
            {{ $kaanna(vuosiluokkakokonaisuus.vuosiluokkakokonaisuus.nimi) }}
          </b-form-checkbox>
        </b-form-checkbox-group>
      </ep-form-content>
    </div>

    <ep-form-content name="ops-nimi-pakollinen" v-if="uusi.pohja">
      <ep-field help="ops-nimi-ohje" v-model="uusi.nimi" :validation="$v.uusi.nimi" :is-editing="true"></ep-field>
    </ep-form-content>
    <div v-if="uusi.pohja">
      <hr/>
      <h2 class="mb-3">{{ $t('organisaatiot') }}</h2>
      <ep-organizations :validation="$v.uusi.organisaatiot"
                        :koulutustyyppi="koulutustyyppi"
                        v-model="uusi.organisaatiot"></ep-organizations>

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
      </div>

      <div class="text-right">
        <b-button class="mr-4" variant="link" :to="{ name: 'opetussuunnitelmaListaus'}">{{$t('peruuta')}}</b-button>
        <ep-button :disabled="$v.uusi.$invalid || addingOpetussuunnitelma" @click="luoUusiOpetussuunnitelma" :show-spinner="isLoading">{{ $t('luo-opetussuunnitelma') }}</ep-button>
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
import { TutoriaaliStore } from '@/stores/tutoriaaliStore';
import { delay } from '@shared/utils/delay';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@/components/EpContent/EpContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpIcon from '@/components/EpIcon/EpIcon.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpOrganizations from '@/components/EpOrganizations/EpOrganizations.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpRoute from '@/mixins/EpRoute';
import {
  Opetussuunnitelmat,
  Opintojaksot,
  Lops2019Oppiaineet,
  OpetussuunnitelmaInfoDto,
  OpetussuunnitelmaLuontiDto,
  Lops2019OpintojaksoDto,
  OpetussuunnitelmaInfoDtoToteutusEnum,
  OpsVuosiluokkakokonaisuusKevytDto,
  OpsVuosiluokkakokonaisuusDto,
} from '@shared/api/ylops';

import { opsLuontiValidator } from '@/validators/ops';
import { isOpsToteutusSupported } from '@/utils/opetussuunnitelmat';
import { Kielet } from '@shared/stores/kieli';

type PohjaTyyppi = 'pohjasta' | 'opsista';

@Component({
  components: {
    EpButton,
    EpContent,
    EpField,
    EpFormContent,
    EpIcon,
    EpInput,
    EpMainView,
    EpNavigation,
    EpOrganizations,
    EpSelect,
    EpSpinner,
    EpToggle,
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
    tuoPohjanOpintojaksot: null,
    ainepainoitteinen: false,
    vuosiluokkakokonaisuudet: [] as (OpsVuosiluokkakokonaisuusDto[]),
  };

  initUusi() {
    this.uusi.pohja = null;
  }

  @Prop({ required: true })
  private tutoriaalistore!: TutoriaaliStore;

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

    if (this.uusi.pohja?.id) {
      if (this.uusi.pohja?.toteutus === OpetussuunnitelmaInfoDtoToteutusEnum.PERUSOPETUS.toLowerCase()) {
        const ops = (await Opetussuunnitelmat.getOpetussuunnitelma(this.uusi.pohja?.id)).data;
        this.vuosiluokkakokonaisuudet = _.sortBy((ops.vuosiluokkakokonaisuudet as OpsVuosiluokkakokonaisuusKevytDto[]), [(vlk) => {
          return this.$kaanna((vlk.vuosiluokkakokonaisuus?.nimi as any));
        }]);
      }
    }
  }

  protected async init() {
    this.oletuspohjat = (await Opetussuunnitelmat.getAll('POHJA', 'VALMIS')).data;
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
    return _.chain(pohjat)
      .filter(pohja => pohja.tila !== 'POISTETTU')
      .filter(pohja => isOpsToteutusSupported(pohja))
      .value();
  }

  updateOletuspohja(value: PohjaTyyppi) {
    this.oletuspohjasta = value;
    this.initUusi();
  }

  public async luoUusiOpetussuunnitelma() {
    this.addingOpetussuunnitelma = true;
    this.loading(async () => {
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
      };

      // FIXME: #swagger
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
        fail('ei-riittavia-oikeuksia-organisaatioissa');
        await delay(300);
        this.addingOpetussuunnitelma = false;
      }
    });
  }

  get validator() {
    if (this.uusi && this.uusi.pohja) {
      return opsLuontiValidator([], this.uusi.pohja.toteutus);
    }

    return {};
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

</style>
