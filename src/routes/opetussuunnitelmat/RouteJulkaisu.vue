<template>
<div class="p-4">
  <div class="d-flex justify-content-between">
      <h2>{{ $t('julkaisunakyma') }}</h2>
      <div v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'pohja' }">
        <EpSpinner v-if="hallintaLoading" />
        <b-dropdown v-else class="asetukset" size="lg" variant="link" dropleft toggle-class="text-decoration-none" no-caret>
          <template v-slot:button-content>
            {{$t('hallinta')}} <fas icon="ratas" class="hallinta" />
          </template>
          <EpButton variant="link" @click="palautaTekstirakenne">
            {{$t('palauta-aiempi-tekstirakenne')}}
          </EpButton>
        </b-dropdown>
      </div>
    </div>
  <div v-html="$t('julkaisuohje')"></div>

  <h3>{{ $t('tarkistukset') }}</h3>
  <div class="validation">
    <div v-if="validating" class="validointi-spinner">
      <EpSpinner />
      <div>{{ $t('validointi-kaynnissa') }}</div>
    </div>
    <div v-else>
      <div v-if="isValid" class="d-flex">
        <div class="material-icons no-errors">check_circle</div>
        <div class="ml-2">{{$t('ei-julkaisua-estavia-virheita')}}</div>
      </div>
      <div v-else class="d-flex">
        <div class="material-icons errors">info</div>
        <div class="ml-2">{{$t('loytyi-julkaisun-estavia-virheita')}}</div>
      </div>

      <div v-for="(validointi, idx) in validoinnit" :key="'validointi'+idx">
        <ep-collapse v-if="validointi.virheet.length > 0 || validointi.huomautukset.length > 0"
                     :borderBottom="false">
          <h3 slot="header">{{ $t(validointi.kategoria) }}</h3>
          <EpJulkaisuValidointi :validointi="validointi" />
        </ep-collapse>
      </div>
    </div>
  </div>

  <hr class="mt-4 mb-4">

  <div class="vaihe" v-if="isValid">
    <h3>{{ $t('tiedot') }}</h3>
    <div>
      <div class="row">
        <div class="col-md-6">
          <ep-form-content name="ops-nimi">
            <ep-field help="ops-nimi-ohje" v-model="ops.nimi">
            </ep-field>
          </ep-form-content>
        </div>
        <div class="col-md-6">
          <ep-form-content name="peruste">
            <ep-field v-model="ops.perusteenDiaarinumero">
            </ep-field>
          </ep-form-content>
        </div>
        <div class="col-md-6">
          <ep-form-content name="julkaisukielet">
            <ep-select help="ops-julkaisukielet-ohje" v-model="ops.julkaisukielet" :items="kielet" :multiple="true">
            </ep-select>
          </ep-form-content>
        </div>
        <div class="col-md-6" v-if="isOps">
          <ep-form-content name="ops-hyvaksyjataho">
            <ep-field help="ops-hyvaksyjataho-ohje" v-model="ops.hyvaksyjataho" type="string">
            </ep-field>
          </ep-form-content>
        </div>
        <div class="col-md-6" v-if="isOps">
          <ep-form-content name="ops-hyvaksymispvm">
            <ep-datepicker v-model="ops.paatospaivamaara" help="ops-hyvaksymispvm-ohje">
            </ep-datepicker>
          </ep-form-content>
        </div>
        <div class="col-md-6" v-if="isOps && julkaisuhistoria && julkaisuhistoria.length > 0">
          <ep-form-content name="esikatsele-opetussuunnitelmaa">
            <ep-external-link :url="esikatseluUrl" :class="{'disabled-events': ops.tila === 'poistettu'}"></ep-external-link>
          </ep-form-content>
        </div>
        <div class="col-md-12">
          <ep-form-content name="ops-kuvaus">
            <ep-content opetussuunnitelma-store="opetussuunnitelmaStore"
                        layout="simplified"
                        v-model="ops.kuvaus"
                        help="ops-kuvaus-ohje">
            </ep-content>
          </ep-form-content>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-4">
    <div v-if="isValid">
      <h3>{{ $t('uusi-julkaisu') }}</h3>
      <b-form-group :label="$t('julkaisun-tiedote')">
        <div class="font-size-08 mb-2">{{$t('tiedote-naytetaan-tyoryhmalle-taman-sivun-julkaisuhistoriassa')}}</div>
        <ep-content v-model="uusiJulkaisu.julkaisutiedote"
                    layout="simplified"
                    :is-editable="true" />
        <EpJulkaisuButton class="mt-3" :julkaise="julkaise" v-oikeustarkastelu="'hallinta'" :julkaisuKesken="julkaisuKesken"/>
      </b-form-group>
    </div>

    <EpJulkaisuHistoria :julkaisut="julkaisuhistoria" :palauta="palautaJulkaisu">
      <div slot="empty">{{ $t('opetussuunnitelmaa-ei-viela-julkaistu') }}</div>
    </EpJulkaisuHistoria>
  </div>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component } from 'vue-property-decorator';
import { UusiJulkaisuDto } from '@shared/api/ylops';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import EpOpsRoute from '@/mixins/EpOpsRoute';
import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpJulkaisuHistoria from '@shared/components/EpJulkaisuHistoria/EpJulkaisuHistoria.vue';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';
import EpJulkaisuValidointi from '@shared/components/EpJulkaisuValidointi/EpJulkaisuValidointi.vue';
import { nodeToRoute } from '@/utils/routing';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpDatepicker,
    EpEditointi,
    EpField,
    EpFormContent,
    EpSelect,
    Tilanvaihto,
    EpSpinner,
    EpJulkaisuHistoria,
    EpExternalLink,
    EpJulkaisuButton,
    EpJulkaisuValidointi,
  },
})
export default class RouteJulkaisu extends EpOpsRoute {
  private uusiJulkaisu: UusiJulkaisuDto = {
    julkaisutiedote: {},
  };

  private hallintaLoading: boolean = false;

  async init() {
    await this.store.updateValidation();
  }

  get graph() {
    return {
      colorScheme: 'vihrea_sininen',
      value: 80,
    };
  }

  get nimi() {
    return this.ops.nimi;
  }

  get kielet() {
    return UiKielet;
  }

  get sisaltoKieli() {
    return Kielet.getSisaltoKieli.value;
  }

  get julkaisuhistoria() {
    return this.julkaisut;
  }

  get isValid() {
    return _.every(this.validoinnit, validointi => _.isEmpty(validointi.virheet));
  }

  mapValidointiRoute(validointi) {
    return {
      route: {
        name: _.get(validointi, 'meta.route.type'),
        params: _.get(validointi, 'meta.route.meta'),
      },
    };
  }

  get validoinnit() {
    if (this.store.validointi) {
      return _.map(this.store.validointi, validointi => {
        return {
          ...validointi,
          virheet: this.listNodeToRoute(validointi.virheet),
          huomautukset: this.listNodeToRoute(validointi.huomautukset),
          huomiot: this.listNodeToRoute(validointi.huomiot),
        };
      });
    }
  }

  listNodeToRoute(list) {
    return _.map(list, item => ({ ...item, route: nodeToRoute(item.navigationNode) }));
  }

  get validating() {
    return !this.store.validointi;
  }

  get julkaisut() {
    return this.store.julkaisut;
  }

  async julkaise() {
    try {
      await this.store.julkaise(this.uusiJulkaisu);
      this.uusiJulkaisu.julkaisutiedote = {};
      this.$success(this.$t('julkaisu-kaynnistetty') as string);
    }
    catch (err) {
      this.$fail(this.$t('julkaisu-epaonnistui') as string);
    }
  }

  get esikatseluUrl() {
    return buildEsikatseluUrl(this.kieli, `/opetussuunnitelma/${this.ops.id}`, `/${koulutustyyppiTheme(this.ops.koulutustyyppi!)}/tiedot`);
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  async palautaJulkaisu(julkaisu) {
    try {
      await this.store.palautaJulkaisu(julkaisu);
      this.$success(this.$t('opetussuunnitelman-julkaisuversio-palautettu-julkiseksi') as string);
    }
    catch (err) {
      this.$fail(this.$t('palautus-epaonnistui') as string);
    }
  }

  get julkaisuKesken() {
    return this.store?.viimeisinJulkaisuTila === 'KESKEN';
  }

  async palautaTekstirakenne() {
    this.hallintaLoading = true;

    try {
      await this.store.palautaTekstirakenne();
      this.$success(this.$t('opetussuunnitelman-vanha-tekstirakenne-palautettu') as string);
    }
    finally {
      this.hallintaLoading = false;
    }
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.validation {
  border: 1px solid #ccc;
  box-shadow: 0 0 20px #eee;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 20px;
}

.validointi-spinner {
  text-align: center;
}

.no-errors {
  color: $green;
}

.errors {
  color: $invalid;
}
</style>
