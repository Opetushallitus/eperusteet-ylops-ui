<template>
  <ep-main-view>
    <template #header>
      <h1>{{ $t('uusi-opetussuunnitelma') }}</h1>
      <span v-html="$t('ylops-uusi-opetussuunnitelma-ohje')" />
    </template>
    <div class="form-group">
      <ep-form-content>
        <template #header>
          <h3>{{ $t('mita-haluat-luoda') }} *</h3>
        </template>
        <b-form-group class="mt-0">
          <EpRadio
            v-model="opetussuunnitelmaOrganisaatioTaso"
            name="uusi-ops-organisaatiotasovalinta"
            value="kunta"
          >
            {{ $t('kunnan-tai-koulutuksen-jarjestajan-opetussuunnitelman') }}
          </EpRadio>
          <EpRadio
            v-model="opetussuunnitelmaOrganisaatioTaso"
            name="uusi-ops-organisaatiotasovalinta"
            value="oppilaitos"
          >
            {{ $t('oppilaitoksen-opetussuunnitelman') }}
          </EpRadio>
        </b-form-group>
      </ep-form-content>
      <ep-form-content name="opetussuunnitelman-pohjatyyppi-pakollinen">
        <b-form-group class="mt-0">
          <EpRadio
            v-model="oletuspohjasta"
            name="uusi-ops-pohjavalinta"
            value="pohjasta"
            @change="updateOletuspohja"
          >
            {{ $t('vain-perustetta') }}
          </EpRadio>
          <EpRadio
            v-model="oletuspohjasta"
            name="uusi-ops-pohjavalinta"
            value="opsista"
            @change="updateOletuspohja"
          >
            {{ $t('toista-opetussuunnitelmaa') }}
          </EpRadio>
        </b-form-group>
      </ep-form-content>
      <div v-if="oletuspohjasta">
        <div class="form-group">
          <div v-if="pohjat">
            <ep-form-content
              v-if="pohjat.length > 0"
              name="uusi-ops-pohja-pakollinen"
            >
              <EpMultiSelect
                v-model="uusi.pohja"
                track-by="id"
                :placeholder="$t('valitse-opetussuunnitelma')"
                :options="pohjatSortedByName"
                :search-identity="nimiSearchIdentity"
                :max-height="500"
                :is-editing="true"
              >
                <template #singleLabel="{ option }">
                  <span>{{ option.esitysMuoto }}</span>
                </template>
                <template #option="{ option }">
                  <span>{{ option.esitysMuoto }}</span>
                </template>
                <template #helptext>
                  <div
                    v-if="uusi.pohja && oletuspohjasta !== 'pohjasta'"
                    class="form-text info-box mt-2"
                  >
                    {{ $t('valittu-' + opetussuunnitelmaOrganisaatioTaso + '-' + luontityyppi.toLowerCase() + '-huomio') }}
                    <template v-if="luontityyppi.toLowerCase() === 'kopio' && opetussuunnitelmaOrganisaatioTaso === 'oppilaitos'">
                      <EpSpinner
                        v-if="!valitunPohjanPohja"
                        class="d-inline-block"
                      />
                      <template v-else-if="valitunPohjanPohja._pohja !== null">
                        <div class="mt-2">
                          {{ $t('valittu-opetussuunnitelma-kopio-huomio') }}
                        </div>
                        <div class="font-weight-bold mt-2">
                          {{ $kaanna(valitunPohjanPohja.nimi) }}
                        </div>
                      </template>
                    </template>
                  </div>
                </template>
              </EpMultiSelect>
            </ep-form-content>
            <div v-else>
              <div class="alert alert-info">
                {{ $t('ei-opetussuunnitelmia') }}
              </div>
            </div>
          </div>
          <ep-spinner v-else />
        </div>
      </div>
    </div>
    <div v-if="oletuspohjasta">
      <hr>
      <ep-form-content
        v-if="uusi.pohja"
        name="ops-nimi-pakollinen"
      >
        <ep-field
          v-model="uusi.nimi"
          help="ops-nimi-ohje"
          :validation="$v.uusi.nimi"
          :is-editing="true"
        />
      </ep-form-content>
      <div v-if="uusi.pohja && uusi.pohja.toteutus === 'perusopetus'">
        <ep-form-content name="vuosiluokkakokonaisuudet-pakollinen">
          <EpSpinner v-if="!vuosiluokkakokonaisuudet" />
          <EpToggleGroup
            v-else
            v-model="uusi.vuosiluokkakokonaisuudet"
            :items="vuosiluokkakokonaisuudet"
            :validation="$v.uusi.vuosiluokkakokonaisuudet"
            :stacked="true"
            :is-editing="true"
          >
            <template #default="{ item }">
              {{ $kaanna(item.vuosiluokkakokonaisuus.nimi) }}
            </template>
          </EpToggleGroup>
        </ep-form-content>
      </div>
      <div v-if="uusi.pohja">
        <hr>
        <div class="d-flex">
          <h2 class="mb-3">
            {{ $t('organisaatiot') }}
          </h2>
          <EpInfoPopover class="ml-2">
            <div v-html="$t('organisaatio-valinta-organisaatio-huomio')" />
          </EpInfoPopover>
        </div>
        <ep-organizations
          v-model="uusi.organisaatiot"
          :validation="$v.uusi.organisaatiot"
          :koulutustyyppi="koulutustyyppi"
        />

        <div v-if="uusi.pohja.toteutus === 'lops2019'">
          <hr>
          <h2 class="mb-3">
            {{ $t('opintojaksot') }}
          </h2>
          <ep-form-content :show-header="false">
            <ep-form-content
              v-if="luontityyppi === LUONTITYYPPI_VIITTEILLA"
              name="ops-opintojakso-tuonti-kysymys"
              class="no-padding"
            >
              <EpRadio
                v-model="uusi.tuoPohjanOpintojaksot"
                name="opintojaksoTuonti"
                :value="true"
                :label="$t('kylla')"
              />
              <EpRadio
                v-model="uusi.tuoPohjanOpintojaksot"
                name="opintojaksoTuonti"
                :value="false"
                :label="$t('ei')"
              />
            </ep-form-content>

            <ep-form-content name="opintojaksojen-tarkistus">
              <ep-toggle
                v-model="uusi.ainepainoitteinen"
                :is-editing="true"
                :is-switch="false"
              >
                {{ $t('ainepainoitteinen') }}
              </ep-toggle>
            </ep-form-content>
          </ep-form-content>

          <template v-if="luontityyppi === LUONTITYYPPI_VIITTEILLA">
            <h2 class="mb-3">
              {{ $t('oppimaarat') }}
            </h2>
            <ep-form-content
              name="ops-oppimaara-tuonti-kysymys"
              class="no-padding"
            >
              <EpRadio
                v-model="uusi.tuoPohjanOppimaarat"
                name="oppimaaraTuonti"
                :value="true"
                :label="$t('kylla')"
              />
              <EpRadio
                v-model="uusi.tuoPohjanOppimaarat"
                name="oppimaaraTuonti"
                :value="false"
                :label="$t('ei')"
              />
            </ep-form-content>
          </template>
        </div>

        <div class="text-right">
          <b-button
            class="mr-4"
            variant="link"
            :to="{ name: 'opetussuunnitelmaListaus'}"
          >
            {{ $t('peruuta') }}
          </b-button>
          <ep-button
            :disabled="$v.uusi.$invalid || addingOpetussuunnitelma"
            :show-spinner="addingOpetussuunnitelma"
            @click="luoUusiOpetussuunnitelma"
          >
            {{ $t('luo-opetussuunnitelma') }}
          </ep-button>
        </div>
      </div>
    </div>
  </ep-main-view>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, watch, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { useRoute, useRouter } from 'vue-router';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpOrganizations from '@/components/EpOrganizations/EpOrganizations.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
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
import { $t, $kaanna, $sd, $success } from '@shared/utils/globals';
import EpRadio from '@shared/components/forms/EpRadio.vue';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';
import EpMainView from '@/components/EpMainView/EpMainView.vue';

type PohjaTyyppi = 'pohjasta' | 'opsista';

// Use composables
const route = useRoute();
const router = useRouter();

// Reactive data
const oletuspohjat = ref<OpetussuunnitelmaInfoDto[] | null>(null);
const opetussuunnitelmat = ref<OpetussuunnitelmaInfoDto[] | null>(null);
const oletuspohjasta = ref<PohjaTyyppi | null>(null);
const opetussuunnitelmaOrganisaatioTaso = ref<LuotavaOpsOrganisaatioTaso>('kunta');
const addingOpetussuunnitelma = ref(false);
const vuosiluokkakokonaisuudet = ref<OpsVuosiluokkakokonaisuusKevytDto[] | null>(null);
const uusi = ref({
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
});
const valitunPohjanPohja = ref<OpetussuunnitelmaNimiDto | null>(null);

// Constants
const LUONTITYYPPI_KOPIO = OpetussuunnitelmaLuontiDtoLuontityyppiEnum.KOPIO;
const LUONTITYYPPI_VIITTEILLA = OpetussuunnitelmaLuontiDtoLuontityyppiEnum.VIITTEILLA;

// Methods
const initUusi = () => {
  uusi.value.pohja = null;
};

// Computed properties
const steps = computed(() => {
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
});

const koulutustyyppi = computed(() => {
  return _.get(uusi.value, 'pohja.koulutustyyppi');
});

const uusiPohjaMuutos = async () => {
  uusi.value.organisaatiot = {
    jarjestajat: [],
    oppilaitokset: [],
    kunnat: [],
  };
  uusi.value.vuosiluokkakokonaisuudet = [];
  valitunPohjanPohja.value = null;

  if (uusi.value.pohja?.id) {
    if (uusi.value.pohja?.toteutus === OpetussuunnitelmaInfoDtoToteutusEnum.PERUSOPETUS.toLowerCase()) {
      vuosiluokkakokonaisuudet.value = null;
      const ops = (await Opetussuunnitelmat.getOpetussuunnitelmaOrganisaatiotarkistuksella(uusi.value.pohja?.id)).data;
      vuosiluokkakokonaisuudet.value = _.sortBy((ops.vuosiluokkakokonaisuudet as OpsVuosiluokkakokonaisuusKevytDto[]), [(vlk) => {
        return $kaanna((vlk.vuosiluokkakokonaisuus?.nimi as any));
      }]);
    }

    const pohjaOps = (await Opetussuunnitelmat.getOpetussuunnitelmaNimi(uusi.value.pohja.id)).data;
    if (pohjaOps._pohja) {
      valitunPohjanPohja.value = (await Opetussuunnitelmat.getOpetussuunnitelmaNimi(_.toNumber(pohjaOps._pohja))).data;
    }
  }
};

const init = async () => {
  oletuspohjat.value = (await Opetussuunnitelmat.getAll('POHJA', OpetussuunnitelmaInfoDtoTilaEnum.VALMIS)).data;
  opetussuunnitelmat.value = (await Opetussuunnitelmat.getOpetussuunnitelmienOpsPohjat()).data;
};

const pohjat = computed(() => {
  if (oletuspohjasta.value === 'pohjasta') {
    return pohjatFilter(oletuspohjat.value);
  }
  else {
    return pohjatFilter(opetussuunnitelmat.value);
  }
});

const pohjatSortedByName = computed(() => {
  return _.sortBy(pohjat.value, pohja => _.toLower(Kielet.kaanna(pohja.nimi)));
});

const pohjatFilter = (pohjatParam: OpetussuunnitelmaInfoDto[] | null) => {
  if (!pohjatParam) {
    return undefined;
  }

  return _.chain(pohjatParam)
    .filter(pohja => pohja.tila !== OpetussuunnitelmaInfoDtoTilaEnum.POISTETTU.toLowerCase())
    .filter(pohja => isOpsToteutusSupported(pohja))
    .filter(pohja => opetussuunnitelmaOrganisaatioTaso.value !== 'kunta' || oletuspohjasta.value === 'pohjasta' || _.includes(pohja.koulutuksenjarjestaja?.tyypit, 'Kunta'))
    .map(pohja => ({
      ...pohja,
      esitysMuoto: `${$kaanna(pohja.nimi)} | ${$t('luotu')} ${$sd(pohja.luotu)} | ${pohja.perusteenDiaarinumero}`,
    }))
    .value();
};

const updateOletuspohja = (value: PohjaTyyppi) => {
  oletuspohjasta.value = value;
  initUusi();
  uusi.value.luontityyppi = OpetussuunnitelmaLuontiDtoLuontityyppiEnum.VIITTEILLA;

  if (oletuspohjasta.value === 'pohjasta') {
    uusi.value.luontityyppi = OpetussuunnitelmaLuontiDtoLuontityyppiEnum.KOPIO;
  }
};

const nimiSearchIdentity = (obj: any) => {
  return _.toLower($kaanna(obj.nimi));
};

const luoUusiOpetussuunnitelma = async () =>   {
  addingOpetussuunnitelma.value = true;
  const ops: OpetussuunnitelmaLuontiDto = {
    nimi: uusi.value.nimi,
    julkaisukielet: [],
    tyyppi: 'ops' as any,
    kunnat: uusi.value.organisaatiot.kunnat,
    organisaatiot: [
      ...uusi.value.organisaatiot.jarjestajat,
      ...uusi.value.organisaatiot.oppilaitokset,
    ],
    ainepainoitteinen: uusi.value.ainepainoitteinen,
    vuosiluokkakokonaisuudet: uusi.value.vuosiluokkakokonaisuudet,
    tuoPohjanOpintojaksot: uusi.value.tuoPohjanOpintojaksot ? uusi.value.tuoPohjanOpintojaksot : false,
    tuoPohjanOppimaarat: uusi.value.tuoPohjanOppimaarat ? uusi.value.tuoPohjanOppimaarat : false,
    luontityyppi: luontityyppi.value,
  };

  (ops as any)._pohja = '' + uusi.value.pohja!.id;
  try {
    const luotu = (await Opetussuunnitelmat.addOpetussuunnitelma(ops)).data;
    $success('lisays-opetussuunnitelma-onnistui');
    router.replace({
      name: 'yleisnakyma',
      params: {
        id: '' + luotu.id,
      },
    });
  }
  catch (err) {
    addingOpetussuunnitelma.value = false;
  }
};

const pohjanKoulutuksenJarjestajanTyyppi = computed(() => {
  if (_.first(_.get(uusi.value, 'pohja.koulutuksenjarjestaja.tyypit')) === 'Oppilaitos') {
    return 'oppilaitos';
  }

  return 'kunta';
});

const luontityyppi = computed(() => {
  if (oletuspohjasta.value === 'pohjasta' || opetussuunnitelmaOrganisaatioTaso.value === 'kunta') {
    return OpetussuunnitelmaLuontiDtoLuontityyppiEnum.KOPIO;
  }

  if (pohjanKoulutuksenJarjestajanTyyppi.value === 'kunta') {
    return OpetussuunnitelmaLuontiDtoLuontityyppiEnum.VIITTEILLA;
  }
  else {
    return OpetussuunnitelmaLuontiDtoLuontityyppiEnum.KOPIO;
  }
});

const validator = computed(() => {
  if (uusi.value && uusi.value.pohja) {
    return opsLuontiValidator([], luontityyppi.value, uusi.value.pohja.toteutus, opetussuunnitelmaOrganisaatioTaso.value);
  }

  return {};
});

// Vuelidate setup
const $v = useVuelidate(
  { uusi: validator },
  { uusi },
);

// Watchers
watch(() => uusi.value.pohja, uusiPohjaMuutos);

watch(opetussuunnitelmaOrganisaatioTaso, () => {
  uusi.value.pohja = null;
});

// Initialize on mount
onMounted(async () => {
  await init();
});

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
