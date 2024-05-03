<template>
<div id="scroll-anchor" class="content">
  <div v-if="hooks">
    <ep-editointi :hooks="hooks" :validator="validator" type="opetussuunnitelma" ref="opstietoeditointi">
      <h2 class="otsikko" slot="header">{{ $t('tiedot') }}</h2>
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
              <ep-form-content name="ops-esikatseltavissa">
                <ep-toggle help="ops-esikatseltavissa-ohje" v-model="data.esikatseltavissa" :is-editing="isEditing"></ep-toggle>
              </ep-form-content>
            </div>
            <div class="col-md-6" v-if="isOps && data.esikatseltavissa && !isEditing" :class="{'disabled-events': data.tila === 'poistettu'}">
              <ep-form-content name="esikatsele-opetussuunnitelmaa">
                <ep-external-link :url="data.opetussuunitelmaUrl"></ep-external-link>
              </ep-form-content>
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
                  <b-form-checkbox v-for="(vuosiluokkakokonaisuus, index) in data.valittavatVuosiluokkakokonaisuudet" :key="'vlk'+index" :value="vuosiluokkakokonaisuus">
                    {{ $kaanna(vuosiluokkakokonaisuus.vuosiluokkakokonaisuus.nimi) }}
                  </b-form-checkbox>
                </b-form-checkbox-group>
                <span v-else v-for="(vuosiluokkakokonaisuus, index) in data.vuosiluokkakokonaisuudet" :key="'vlk'+index" >
                  <span v-if="index > 0">, </span>{{ $kaanna(vuosiluokkakokonaisuus.vuosiluokkakokonaisuus.nimi) }}
                </span>
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
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Component } from 'vue-property-decorator';
import { opsTiedotValidator } from '@/validators/ops';
import { Kielet } from '@shared/stores/kieli';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import { buildEsikatseluUrl, buildKatseluUrl } from '@shared/utils/esikatselu';
import { isLukio, koulutustyyppiTheme } from '@shared/utils/perusteet';
import { OpetussuunnitelmaKevytDtoToteutusEnum, OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpOrganizations from '@/components/EpOrganizations/EpOrganizations.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpJulkaisuLista from '@shared/components/EpJulkaisuHistoriaJulkinen/EpJulkaisuLista.vue';
import OpsPohjat from '@/routes/opetussuunnitelmat/tiedot/OpsPohjat.vue';

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
    Tilanvaihto,
    EpExternalLink,
    EpOrganizations,
    EpMaterialIcon,
  },
})
export default class RouteTiedot extends EpOpsRoute {
  private hooks: EditointiKontrolliConfig | null = null;

  async mounted() {
    this.hooks = {
      source: {
        save: this.save,
        load: this.load,
        confirm: this.confirm,
      },
    };
  }

  get validator() {
    return opsTiedotValidator([
      Kielet.getSisaltoKieli.value, // Validoidaan kentät sisältökielen mukaan
    ], !this.isPohja);
  }

  get tila() {
    return this.ops.tila;
  }

  public async tryTilanvaihto(tila: string) {
    try {
      await this.store.updateTila(tila);
      return true;
    }
    catch (err) {
      return false;
    }
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

  get fetchedData() {
    return (this.$refs?.opstietoeditointi as any).stateData;
  }

  get kunnatJaOrganisaatiotSorted() {
    return _.sortBy(
      [
        ...(this.fetchedData?.kunnat ? this.fetchedData.kunnat : []),
        ...(this.fetchedData?.organisaatiot ? this.fetchedData.organisaatiot : []),
      ], (org: any) => this.$kaanna(org.nimi),
    );
  }

  private async load() {
    try {
      if (this.$route.params.id) {
        const ops = await this.store.get();
        let pohjanVuosiluokkakokonaisuudet: OpsVuosiluokkakokonaisuusKevytDto[] | null = null;
        if (ops.toteutus === _.toLower(OpetussuunnitelmaKevytDtoToteutusEnum.PERUSOPETUS)) {
          pohjanVuosiluokkakokonaisuudet = await this.store.getPohjanVuosiluokkakokonaisuudet(ops);
        }

        return {
          ...ops,
          perusteUrl: buildKatseluUrl(this.kieli, `/${koulutustyyppiTheme(ops.koulutustyyppi!)}/${ops.perusteenId}/tiedot`),
          opetussuunitelmaUrl: buildEsikatseluUrl(this.kieli, `/opetussuunnitelma/${ops.id}`, `/${koulutustyyppiTheme(ops.koulutustyyppi!)}/tiedot`),
          kaikkiOrganisaatiot: {
            kunnat: ops.kunnat,
            jarjestajat: ops.organisaatiot,
            oppilaitokset: ops.organisaatiot,
            ryhmat: [],
          },
          vuosiluokkakokonaisuudet: _.sortBy(ops.vuosiluokkakokonaisuudet, vlk => this.$kaanna((vlk.vuosiluokkakokonaisuus?.nimi as any))),
          valittavatVuosiluokkakokonaisuudet: _.chain([
            ...ops.vuosiluokkakokonaisuudet as Array<any>,
            ...(_.filter(pohjanVuosiluokkakokonaisuudet,
              pohjaVlk => !_.includes(_.map(ops.vuosiluokkakokonaisuudet, opsVlk => _.get(opsVlk.vuosiluokkakokonaisuus, '_tunniste')), _.get(pohjaVlk.vuosiluokkakokonaisuus, '_tunniste')))),
          ])
            .sortBy(vlk => this.$kaanna((vlk.vuosiluokkakokonaisuus?.nimi as any)))
            .value(),
          oldVuosiluokkakokonaisuudet: ops.vuosiluokkakokonaisuudet,
        };
      }
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
  }

  private async save(opetussuunnitelma: any) {
    opetussuunnitelma = {
      ...opetussuunnitelma,
      kunnat: opetussuunnitelma.kaikkiOrganisaatiot.kunnat,
      organisaatiot: [
        ...opetussuunnitelma.kaikkiOrganisaatiot.jarjestajat,
        ...opetussuunnitelma.kaikkiOrganisaatiot.oppilaitokset,
        ...opetussuunnitelma.kaikkiOrganisaatiot.ryhmat,
      ],

    };
    await this.store.save(opetussuunnitelma);
  }

  private async confirm(opetussuunnitelma: any) {
    if (opetussuunnitelma.toteutus === 'perusopetus') {
      const vanhatVlkTunnisteet = _.map(opetussuunnitelma.oldVuosiluokkakokonaisuudet, opsVlk => _.get(opsVlk.vuosiluokkakokonaisuus, '_tunniste'));
      const uudetVlkTunnisteet = _.map(opetussuunnitelma.vuosiluokkakokonaisuudet, opsVlk => _.get(opsVlk.vuosiluokkakokonaisuus, '_tunniste'));

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
