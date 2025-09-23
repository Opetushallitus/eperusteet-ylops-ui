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

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpPerustietoData from '@shared/components/EpPerustietoData/EpPerustietoData.vue';
import OpsPohjat from '@/routes/opetussuunnitelmat/tiedot/OpsPohjat.vue';
import { useEpOpsComponent } from '@/mixins/EpOpsComponent';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { Kielet } from '@shared/stores/kieli';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import { $t, $sdt } from '@shared/utils/globals';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const { store, ops } = useEpOpsComponent(props.opetussuunnitelmaStore);

const naytaLisaaTyoryhmaa = ref<boolean>(false);
const tyoryhmaAlkuMaara = 5;

const julkaisukieliet = computed(() => {
  return _.map(ops.value.julkaisukielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
});

const virkailijat = computed(() => {
  return store.value.virkailijat;
});

const virkailijatFormatted = computed(() => {
  return _.chain(virkailijat.value)
    .map(virkailija => {
      return {
        oid: virkailija.oid,
        esitysnimi: parsiEsitysnimi(virkailija),
      };
    })
    .take(!naytaLisaaTyoryhmaa.value ? tyoryhmaAlkuMaara : _.size(virkailijat.value))
    .value();
});

const esikatseluUrl = computed(() => {
  return buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/opetussuunnitelma/${ops.value.id}`, `/${koulutustyyppiTheme(ops.value.koulutustyyppi!)}/tiedot`);
});

onMounted(async () => {
  await store.value.fetchOrganisaatioVirkailijat();
});
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
