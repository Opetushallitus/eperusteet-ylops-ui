<template>
  <div class="content">
    <router-link :to="{ name: 'opsTiedot' }">
      <h2>{{$t('opetussuunnitelman-tiedot')}}</h2>
    </router-link>

    <ep-spinner v-if="!ops || !virkailijat"></ep-spinner>
    <div v-else>

      <div class="row">
        <div class="col-5">
          <EpPerustietoData icon="account_balance">
            <template #header>{{ $t('peruste')}}</template>
            {{ops.perusteenDiaarinumero}}
          </EpPerustietoData>
        </div>
        <div class="col-7">
          <EpPerustietoData icon="language">
            <template #header>{{ $t('julkaisukielet')}}</template>
            {{julkaisukieliet}}
          </EpPerustietoData>
        </div>
      </div>

      <div class="row">
        <div class="col-5">
          <EpPerustietoData icon="calendar_month">
            <template #header>{{ $t('luotu')}}</template>
            {{ $sdt(ops.luotu)}}
          </EpPerustietoData>
        </div>
        <div class="col-7">
          <EpPerustietoData icon="calendar_month">
            <template #header>{{ $t('julkaistu')}}</template>
            {{ $sdt(ops.viimeisinJulkaisuAika)}}
          </EpPerustietoData>
        </div>
      </div>

      <div class="row">
        <div class="col-5">
          <EpPerustietoData icon="groups">
            <template #header>{{ $t('tyoryhma')}}</template>
            <p v-for="virkailija in virkailijatFormatted" :key="virkailija.oid" class="mb-1">
              {{ virkailija.esitysnimi }}
            </p>
            <ep-button v-if="!naytaLisaaTyoryhmaa && virkailijat.length > tyoryhmaAlkuMaara" @click="naytaLisaaTyoryhmaa = true" variant="link" buttonClass="pl-0 mt-2">
              {{$t('nayta-lisaa')}}
            </ep-button>
            <ep-button v-if="naytaLisaaTyoryhmaa" @click="naytaLisaaTyoryhmaa = false" variant="link" buttonClass="pl-0 mt-2">
              {{$t('piilota')}}
            </ep-button>
          </EpPerustietoData>
        </div>
        <div class="col-7">
          <EpPerustietoData icon="visibility">
            <template #header>{{ $t('esikatsele-opetussuunnitelmaa')}}</template>
            <template v-if="!ops.esikatseltavissa">{{ $t('esikatselua-ei-ole-sallittu') }}</template>
            <template v-else>
              <ep-external-link :url="esikatseluUrl"></ep-external-link>
            </template>
          </EpPerustietoData>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <EpPerustietoData icon="folder">
            <template #header>{{ $t('pohjat')}}</template>
            <OpsPohjat :ops="ops"></OpsPohjat>
          </EpPerustietoData>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Mixins } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import { parsiEsitysnimi } from '@/stores/kayttaja';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpOpsComponent from '../../../mixins/EpOpsComponent';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import OpsPohjat from '@/routes/opetussuunnitelmat/tiedot/OpsPohjat.vue';
import EpPerustietoData from '@shared/components/EpPerustietoData/EpPerustietoData.vue';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpMaterialIcon,
    OpsPohjat,
    EpPerustietoData,
  },
})
export default class OpsPerustiedot extends Mixins(EpOpsComponent) {
  private naytaLisaaTyoryhmaa: boolean = false;
  private tyoryhmaAlkuMaara = 5;

  get julkaisukieliet() {
    return _.map(this.ops.julkaisukielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
  }

  async mounted() {
    await this.store.fetchOrganisaatioVirkailijat();
  }

  private get virkailijat() {
    return this.store.virkailijat;
  }

  private get virkailijatFormatted() {
    return _.chain(this.virkailijat)
      .map(virkailija => {
        return {
          oid: virkailija.oid,
          esitysnimi: parsiEsitysnimi(virkailija),
        };
      })
      .take(!this.naytaLisaaTyoryhmaa ? this.tyoryhmaAlkuMaara : _.size(this.virkailijat))
      .value();
  }

  get esikatseluUrl() {
    return buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/opetussuunnitelma/${this.ops.id}`, `/${koulutustyyppiTheme(this.ops.koulutustyyppi!)}/tiedot`);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
  .content {

    .data-content {
      padding:10px;
      min-width: 160px;

      .icon {
        color: $blue-lighten-6;
      }

      .topic {
        font-weight: bold;
      }
    }
  }
</style>
