<template>
  <div class="p-4">
    <div class="d-flex justify-content-between">
      <h2>{{ $t('julkaisunakyma') }}</h2>
      <div v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'pohja' }">
        <EpSpinner v-if="hallintaLoading" />
        <b-dropdown
          v-else
          class="asetukset"
          size="lg"
          variant="link"
          dropleft
          toggle-class="text-decoration-none"
          no-caret
        >
          <template #button-content>
            {{ $t('hallinta') }}
            <EpMaterialIcon icon-shape="outlined">
              settings
            </EpMaterialIcon>
          </template>
          <EpButton
            variant="link"
            @click="palautaTekstirakenne"
          >
            {{ $t('palauta-aiempi-tekstirakenne') }}
          </EpButton>
        </b-dropdown>
      </div>
    </div>
    <div>
      <h3>{{ $t('julkaisun-vaikutukset') }}</h3>
      <ul>
        <li>{{ $t('opetussuunnitelma-julkaisun-vaikutukset-1') }}</li>
        <li>{{ $t('opetussuunnitelma-julkaisun-vaikutukset-2') }}</li>
        <li>{{ $t('opetussuunnitelma-julkaisun-vaikutukset-3') }}</li>
        <li>{{ $t('opetussuunnitelma-julkaisun-vaikutukset-4') }}</li>
      </ul>
    </div>

    <h3>{{ $t('tarkistukset') }}</h3>
    <div class="validation">
      <div
        v-if="validating"
        class="validointi-spinner"
      >
        <EpSpinner />
        <div>{{ $t('validointi-kaynnissa') }}</div>
      </div>
      <div v-else>
        <div
          v-if="isValid"
          class="d-flex"
        >
          <EpMaterialIcon class="no-errors">
            check_circle
          </EpMaterialIcon>
          <div class="ml-2">
            {{ $t('ei-julkaisua-estavia-virheita') }}
          </div>
        </div>
        <div
          v-else
          class="d-flex"
        >
          <EpMaterialIcon class="errors">
            info
          </EpMaterialIcon>
          <div class="ml-2">
            {{ $t('loytyi-julkaisun-estavia-virheita') }}
          </div>
        </div>

        <div
          v-for="(validointi, idx) in validoinnit"
          :key="'validointi'+idx"
        >
          <ep-collapse
            v-if="validointi.virheet.length > 0 || validointi.huomautukset.length > 0"
            :border-bottom="false"
          >
            <template #header>
              <h3>{{ $t(validointi.kategoria) }}</h3>
            </template>
            <EpJulkaisuValidointi :validointi="validointi" />
          </ep-collapse>
        </div>
      </div>
    </div>

    <hr class="mt-4 mb-4">

    <div
      v-if="isValid"
      class="vaihe"
    >
      <h3>{{ $t('tiedot') }}</h3>
      <div>
        <div class="row">
          <div class="col-md-6">
            <ep-form-content name="ops-nimi">
              <ep-field
                v-model="ops.nimi"
                help="ops-nimi-ohje"
              />
            </ep-form-content>
          </div>
          <div class="col-md-6">
            <ep-form-content name="peruste">
              <ep-field v-model="ops.perusteenDiaarinumero" />
            </ep-form-content>
          </div>
          <div class="col-md-6">
            <ep-form-content name="julkaisukielet">
              <ep-select
                v-model="ops.julkaisukielet"
                help="ops-julkaisukielet-ohje"
                :items="kielet"
                :multiple="true"
              />
            </ep-form-content>
          </div>
          <div
            v-if="isOps"
            class="col-md-6"
          >
            <ep-form-content name="ops-hyvaksyjataho">
              <ep-field
                v-model="ops.hyvaksyjataho"
                help="ops-hyvaksyjataho-ohje"
                type="string"
              />
            </ep-form-content>
          </div>
          <div
            v-if="isOps"
            class="col-md-6"
          >
            <ep-form-content name="ops-hyvaksymispvm">
              <ep-datepicker
                v-model="ops.paatospaivamaara"
                help="ops-hyvaksymispvm-ohje"
              />
            </ep-form-content>
          </div>
          <div
            v-if="isOps && julkaisuhistoria && julkaisuhistoria.length > 0"
            class="col-md-6"
          >
            <ep-form-content name="esikatsele-opetussuunnitelmaa">
              <ep-external-link
                :url="esikatseluUrl"
                :class="{'disabled-events': ops.tila === 'poistettu'}"
              />
            </ep-form-content>
          </div>
          <div class="col-md-12">
            <ep-form-content name="ops-kuvaus">
              <ep-content
                v-model="ops.kuvaus"
                opetussuunnitelma-store="opetussuunnitelmaStore"
                layout="simplified"
                help="ops-kuvaus-ohje"
              />
            </ep-form-content>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div v-if="!validating && isValid">
        <h3>{{ $t('uusi-julkaisu') }}</h3>
        <b-form-group :label="$t('julkaisun-tiedote')">
          <div class="font-size-08 mb-2">
            {{ $t('tiedote-naytetaan-tyoryhmalle-taman-sivun-julkaisuhistoriassa') }}
          </div>
          <ep-content
            v-model="uusiJulkaisu.julkaisutiedote"
            layout="simplified"
            :is-editable="true"
          />
          <EpJulkaisuButton
            v-oikeustarkastelu="'hallinta'"
            class="mt-3"
            :julkaise="julkaise"
            :julkaisu-kesken="julkaisuKesken"
          />
        </b-form-group>
      </div>

      <EpJulkaisuHistoria
        :julkaisut="julkaisuhistoria"
        :palauta="palautaJulkaisu"
      >
        <template #empty>
          <div>{{ $t('opetussuunnitelmaa-ei-viela-julkaistu') }}</div>
        </template>
        <template #katsele="{ julkaisu }">
          <ep-external-link
            v-if="julkaisu"
            :url="opintopolkuKatseluUrl(julkaisu)"
          >
            {{ $t('katsele') }}
          </ep-external-link>
        </template>
      </EpJulkaisuHistoria>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, inject } from 'vue';
import _ from 'lodash';
import { UusiJulkaisuDto } from '@shared/api/ylops';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpJulkaisuHistoria from '@shared/components/EpJulkaisuHistoria/EpJulkaisuHistoria.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';
import EpJulkaisuValidointi from '@shared/components/EpJulkaisuValidointi/EpJulkaisuValidointi.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { buildEsikatseluUrl, buildKatseluUrl } from '@shared/utils/esikatselu';
import { koulutustyyppiTheme } from '@shared/utils/perusteet';
import { nodeToRoute } from '@/utils/routing';
import { Koulutustyyppi } from '@shared/tyypit';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $fail, $success } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Use the composable
const store = computed(() => props.opetussuunnitelmaStore);
const ops = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value);
const isOps = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.tyyppi as string === 'ops');
// Reactive data
const uusiJulkaisu = ref<UusiJulkaisuDto>({
  julkaisutiedote: {},
});

const hallintaLoading = ref(false);

// Lifecycle
onMounted(async () => {
  await store.value.updateValidation();
});

// Computed properties
const graph = computed(() => {
  return {
    colorScheme: 'vihrea_sininen',
    value: 80,
  };
});

const nimi = computed(() => {
  return ops.value.nimi;
});

const kielet = computed(() => {
  return UiKielet;
});

const sisaltoKieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const julkaisuhistoria = computed(() => {
  return julkaisut.value;
});

const isValid = computed(() => {
  return _.every(validoinnit.value, validointi => _.isEmpty(validointi.virheet));
});

// Methods
const mapValidointiRoute = (validointi: any) => {
  return {
    route: {
      name: _.get(validointi, 'meta.route.type'),
      params: _.get(validointi, 'meta.route.meta'),
    },
  };
};

const listNodeToRoute = (list: any[]) => {
  return _.map(list, item => ({ ...item, route: nodeToRoute(item.navigationNode) }));
};

const validoinnit = computed(() => {
  if (store.value.validointi.value) {
    return _.map(store.value.validointi.value, validointi => {
      return {
        ...validointi,
        virheet: listNodeToRoute(validointi.virheet),
        huomautukset: listNodeToRoute(validointi.huomautukset),
        huomiot: listNodeToRoute(validointi.huomiot),
      };
    });
  }
  return undefined;
});

const validating = computed(() => {
  return store.value.validointi.value === undefined || store.value.validointi.value === null;
});

const julkaisut = computed(() => {
  return store.value.julkaisut.value;
});

const julkaise = async () => {
  try {
    await store.value.julkaise(uusiJulkaisu.value);
    uusiJulkaisu.value.julkaisutiedote = {};
    $success('julkaisu-kaynnistetty');
  }
  catch (err) {
    console.log(err);
    $fail('julkaisu-epaonnistui');
  }
};

const esikatseluUrl = computed(() => {
  return buildEsikatseluUrl(kieli.value, `/opetussuunnitelma/${ops.value.id}`, `/${koulutustyyppiTheme(ops.value.koulutustyyppi!)}/tiedot`);
});

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const palautaJulkaisu = async (julkaisu: any) => {
  try {
    await store.value.palautaJulkaisu(julkaisu);
    $success('opetussuunnitelman-julkaisuversio-palautettu-julkiseksi');
  }
  catch (err) {
    $fail('palautus-epaonnistui');
  }
};

const julkaisuKesken = computed(() => {
  return store.value?.viimeisinJulkaisuTila.value === 'KESKEN';
});

const palautaTekstirakenne = async () => {
  hallintaLoading.value = true;

  try {
    await store.value.palautaTekstirakenne();
    $success('opetussuunnitelman-vanha-tekstirakenne-palautettu');
  }
  finally {
    hallintaLoading.value = false;
  }
};

const opintopolkuKatseluUrl = (julkaisu: any) => {
  let revision = julkaisu.revision;
  if (revision === _.max(_.map(julkaisut.value, 'revision'))) {
    revision = null;
  }
  return buildKatseluUrl(Kielet.getSisaltoKieli.value, `/opetussuunnitelma/${ops.value.id}`, revision, `/${koulutustyyppiTheme(ops.value.koulutustyyppi!)}`);
};
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
