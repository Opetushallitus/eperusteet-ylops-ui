<template>
<div id="scroll-anchor" class="content">
  <div v-if="hooks">
    <ep-editointi :hooks="hooks" :validator="validator" type="opetussuunnitelma">
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
            <div class="col-md-6" v-if="data.pohja && data.pohja.id && data.pohja.tyyppi === 'ops'">
              <ep-form-content name="pohja">
                <router-link :to="{ name:'opsTiedot', params: { id: data.pohja.id } }" target="_blank" rel="noopener noreferrer">
                  <span>{{ $kaanna(data.pohja.nimi) || data.pohja.id }}</span>
                </router-link>
              </ep-form-content>
            </div>
            <div class="col-md-6">
              <div class="d-flex align-items-center">
                <div>
                  <ep-form-content name="tila">
                    {{$t(tila)}}
                  </ep-form-content>
                </div>
                <div class="ml-4" v-if="!isEditing && !isOps && !isValmisPohja">
                  <tilanvaihto v-model="data.tila" :onSave="tryTilanvaihto" :is-pohja="true">
                  </tilanvaihto>
                </div>
              </div>
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
            <div class="col-md-6" v-if="isOps && data.esikatseltavissa && !isEditing">
              <ep-form-content name="esikatsele-opetussuunnitelmaa">
                <ep-external-link :url="data.opetussuunitelmaUrl"></ep-external-link>
              </ep-form-content>
            </div>
            <div class="col-md-6">
              <ep-form-content name="ops-organisaatiot">
                <ul>
                  <li v-for="(kunta, idx) in data.kunnat" :key="idx + 1">
                    {{ $kaanna(kunta.nimi) }}
                  </li>
                  <li v-for="(organisaatio, idx) in data.organisaatiot" :key="idx * 1000">
                    {{ $kaanna(organisaatio.nimi) }}
                  </li>
                </ul>
              </ep-form-content>
            </div>
             <div class="col-md-6" v-if="hasContentFilters">
              <ep-form-content name="sisallon-tuonti" v-if="features.opintojaksot">
                <div>
                  <ep-toggle v-model="data.tuoPohjanOpintojaksot" :is-editing="isEditing">
                    {{ $t('tuo-pohjan-organisaation-opintojaksot') }}
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
              <ep-form-content name="ops-kuvaus">
                <ep-content layout="normal"
                            :opetussuunnitelma-store="opetussuunnitelmaStore"
                            v-model="data.kuvaus"
                            help="ops-kuvaus-ohje"
                            :validation="validation.kuvaus"
                            :is-editable="isEditing"> </ep-content>
              </ep-form-content>
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
import EpContent from '@/components/EpContent/EpContent.vue';
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
import EpProgress from '@/components/EpProgress/EpProgress.vue';
import EpLinkki from '@shared/components/EpLinkki/EpLinkki.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { isLukio } from '@shared/utils/perusteet';
import { OpetussuunnitelmaInfoDtoToteutusEnum, OpetussuunnitelmaKevytDto } from '@shared/api/ylops';

@Component({
  components: {
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpField,
    EpFormContent,
    EpProgress,
    EpSelect,
    EpToggle,
    EpLinkki,
    Tilanvaihto,
    EpExternalLink,
  },
})
export default class RouteTiedot extends EpOpsRoute {
  private hooks: EditointiKontrolliConfig | null = null;

  async mounted() {
    this.hooks = {
      source: {
        save: this.save,
        load: this.load,
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
    };
  }

  private get kielet() {
    return ['fi', 'sv', 'en'];
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  private async load() {
    if (this.$route.params.id) {
      const ops = await this.store.get();
      return {
        ...ops,
        perusteUrl: buildEsikatseluUrl(this.kieli, `/${this.opintopolkuOhjausUrl[_.toString(ops.toteutus)]}/${ops.perusteenId}/tiedot`),
        opetussuunitelmaUrl: buildEsikatseluUrl(this.kieli, `/opetussuunnitelma/${ops.id}/${this.opintopolkuOhjausUrl[_.toString(ops.toteutus)]}/tiedot`),
      };
    }
  }

  private async save(opetussuunnitelma: OpetussuunnitelmaKevytDto) {
    await this.store.save(opetussuunnitelma);
  }

  get opintopolkuOhjausUrl() {
    return {
      'perusopetus': 'perusopetus',
      'lops2019': 'lukiokoulutus',
    };
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
.otsikko {
    margin-bottom: 0;
}
/deep/ .linkki a {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}
</style>
