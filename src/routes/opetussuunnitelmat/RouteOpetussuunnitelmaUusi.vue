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
          <b-form-radio v-model="oletuspohjasta" name="uusi-ops-pohjavalinta" value="opsista">{{ $t('toinen-opetussuunnitelma') }}</b-form-radio>
          <b-form-radio v-model="oletuspohjasta" name="uusi-ops-pohjavalinta" value="pohjasta">{{ $t('oletuspohja') }}</b-form-radio>
        </b-form-group>
      </div>
    </div>
    <div v-if="oletuspohjasta">
      <div class="form-group">
        <div v-if="pohjat">
          <ep-form-content v-if="pohjat.length > 0" name="uusi-ops-pohja-pakollinen">
            <ep-select v-model="uusi.pohja"
                       :items="pohjat"
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
    <ep-form-content name="ops-nimi-pakollinen">
      <ep-field help="ops-nimi-ohje" v-model="uusi.nimi" :validation="$v.uusi.nimi" :is-editing="true"></ep-field>
    </ep-form-content>
    <div v-if="uusi.pohja">
      <hr/>
      <h2 class="mb-3">{{ $t('organisaatiot') }}</h2>
      <ep-organizations :validation="$v.uusi.organisaatiot" :koulutustyyppi="koulutustyyppi" v-model="uusi.organisaatiot"></ep-organizations>

      <hr/>
      <h2 class="mb-3">{{ $t('opintojaksot') }}</h2>
      <ep-form-content :showHeader="false" v-if="uusi.pohjanOpintojaksot">
        <ep-form-content name="ops-opintojakso-tuonti-kysymys" class="no-padding" v-if="uusi.pohjanOpintojaksot.length > 0">
          <b-form-group>
            <b-form-radio v-model="opintojaksoTuonti" name="opintojaksoTuonti" value="true">{{$t('kylla')}}</b-form-radio>
            <b-form-radio v-model="opintojaksoTuonti" name="opintojaksoTuonti" value="false">{{$t('ei')}}</b-form-radio>
          </b-form-group>
        </ep-form-content>

        <ep-form-content name="opintojaksojen-tarkistus">
          <ep-toggle v-model="uusi.ainepainoitteinen" :is-editing="true" :is-switch="false">{{$t('ainepainoitteinen')}}</ep-toggle>
        </ep-form-content>

      </ep-form-content>
      <ep-spinner v-else />

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
  Opetussuunnitelmat, Opintojaksot, Oppiaineet
} from '@shared/api/ylops';
import {
  OpetussuunnitelmaInfoDto,
  OpetussuunnitelmaLuontiDto,
  Lops2019OpintojaksoDto,
} from '@shared/api/ylops';

import { opsLuontiValidator } from '@/validators/ops';

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
  validations: {
    uusi: opsLuontiValidator(),
  },
} as any)
export default class RouteOpetussuunnitelmaUusi extends Mixins(validationMixin, EpRoute) {
  private oletuspohjat: OpetussuunnitelmaInfoDto[] | null = null;
  private opetussuunnitelmat: OpetussuunnitelmaInfoDto[] | null = null;
  private oletuspohjasta: 'pohjasta' | 'opsista' | null = null;
  private addingOpetussuunnitelma = false;
  private opintojaksoTuonti = false;
  private uusi = {
    pohja: null as (OpetussuunnitelmaInfoDto | null),
    nimi: {},
    organisaatiot: {
      jarjestajat: [],
      oppilaitokset: [],
      kunnat: [],
    },
    ainepainoitteinen: false,
    pohjanOpintojaksot: null as (Lops2019OpintojaksoDto[] | null),
  };

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

  @Watch('oletuspohjasta')
  oletuspohjavalintaMuutos() {
    this.uusi.pohja = null;
  }

  @Watch('uusi.pohja')
  async uusiPohjaMuutos() {
    this.uusi.organisaatiot= {
      jarjestajat: [],
      oppilaitokset: [],
      kunnat: [],
    };

    if(this.uusi.pohja?.id) {
      this.uusi.pohjanOpintojaksot = null;
      const paikalliset = (await Oppiaineet.getAllLops2019PaikallisetOppiainet(this.uusi.pohja.id)).data;
      const paikallistenKoodit = _.map(paikalliset, 'koodi');

      this.uusi.pohjanOpintojaksot = _.chain((await Opintojaksot.getAllOpintojaksot(this.uusi.pohja.id)).data)
        .filter(opintojakso => !_.some(opintojakso.oppiaineet, oppiaine => _.includes(paikallistenKoodit, oppiaine.koodi)))
        .value();;
    }
  }

  protected async init() {
    this.oletuspohjat = (await Opetussuunnitelmat.getAll('POHJA', 'VALMIS')).data;
    this.opetussuunnitelmat = (await Opetussuunnitelmat.getAll('OPS')).data;
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
      .filter(pohja => pohja.toteutus === 'lops2019')
      .value();
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
      };

      // FIXME: #swagger
      (ops as any)._pohja = '' + this.uusi.pohja!.id;
      try {
        const luotu = (await Opetussuunnitelmat.addOpetussuunnitelma(ops)).data;

        if (this.opintojaksoTuonti && _.size(this.uusi.pohjanOpintojaksot) > 0 && luotu.id && this.uusi.pohjanOpintojaksot) {
          await Opintojaksot.addTuodutOpintojaksot(luotu.id, this.uusi.pohjanOpintojaksot);
        }

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
