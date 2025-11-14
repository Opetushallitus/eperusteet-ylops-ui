<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :versionumero="versionumero"
      :confirm-copy="false"
      :skip-redirect-back="true"
      label-remove-clarification="oppimaara-poisto-modal-selite"
      :pre-save="varmistaValutus"
    >
      <template #kopioi-teksti>
        {{ $t('muokkaa') }}
      </template>

      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.oppiaine.nimi) }}
        </h2>
      </template>

      <template #additionalInfo="{ data }">
        <span
          v-if="data.vuosiluokkakokonaisuus && data.vuosiluokkakokonaisuus.piilotettu"
          class="additional-info-text"
        >({{ $t('piilotettu') }})</span>
      </template>

      <template #piilotettu>
        <div>{{ $t('oavlk-on-piilotettu') }}</div>
      </template>
      <template #default="{ data, isEditing, isCopyable, validation, supportData }">
        <div
          v-if="data.vuosiluokkakokonaisuus && data.vuosiluokkakokonaisuus.piilotettu"
          class="disabled-text mb-4"
        >
          {{ $t('piilotettu-julkisesta-opetussuunnitelmasta') }}
        </div>

        <div
          v-if="!data.perusteenOppiaine"
          class="alert alert-danger"
        >
          {{ $t('ei-perustetta-info') }}
        </div>

        <ep-form-content
          v-if="isOppiaineUskontoTaiVierasKieli && isEditing"
          :name="'oppimaaran-nimi'"
        >
          <ep-field
            v-model="data.oppiaine.nimi"
            :is-header="true"
            :is-editing="isEditing"
            :validation="validation.oppiaine.nimi"
            :show-valid-validation="false"
          />
        </ep-form-content>

        <vuosiluokka-sisalto-teksti
          v-model="data.oppiaine.tehtava"
          :peruste-object="perusteenOppiaine.tehtava"
          :pohja-object="supportData.pohjanOppiaine.tehtava"
          :is-editing="isEditing"
          :peruste-teksti-avattu="true"
        />
        <hr class="mt-5 mb-4">

        <template v-if="perusteenOppiaine.vapaatTekstit">
          <ep-collapse
            v-for="(vapaateksti, index) in perusteenOppiaineVapaatTekstit"
            :key="'perustevapaateksti' + index"
            tyyppi="perusteteksti"
            :border-bottom="true"
            :border-top="false"
            :expanded-by-default="true"
          >
            <template #header>
              <h4>{{ $kaanna(vapaateksti.nimi) }}</h4>
            </template>
            <span v-html="$kaanna(vapaateksti.teksti)" />

            <h4 class="mt-4">
              {{ $t('paikallinen-teksti') }}
            </h4>
            <EpButton
              v-if="isEditing && !vapaateksti.hasPaikallinenTarkennus"
              icon="add"
              variant="link"
              class="mb-1"
              @click="lisaaPaikallinenTarkennus(data.oppiaine, vapaateksti.id)"
            >
              {{ $t('lisaa-paikallinen-tarkennus') }}
            </EpButton>
            <EpAlert
              v-if="!isEditing && !vapaateksti.hasPaikallinenTarkennus"
              :text="$t('paikallista-sisaltoa-ei-maaritetty')"
            />

            <div
              v-for="(teksti, index) in data.oppiaine.vapaatTekstit"
              :key="'teksti'+index"
            >
              <div v-if="vapaateksti.id === teksti.perusteenVapaaTekstiId">
                <EpContent
                  v-model="teksti.paikallinenTarkennus"
                  layout="normal"
                  :is-editable="isEditing"
                />

                <EpButton
                  v-if="isEditing"
                  variant="link"
                  icon="delete"
                  @click="poistaPaikallinenTarkennus(data.oppiaine, vapaateksti.id)"
                >
                  {{ $t('poista-paikallinen-tarkennus') }}
                </EpButton>
              </div>
            </div>
          </ep-collapse>
        </template>

        <div v-if="data.vuosiluokkakokonaisuus && perusteenVuosiluokkakokonaisuus.tehtava">
          <vuosiluokka-sisalto-teksti
            v-model="data.vuosiluokkakokonaisuus.tehtava"
            :peruste-object="perusteenVuosiluokkakokonaisuus.tehtava"
            :pohja-object="pohjaOppiaineenVuosiluokkakokonaisuus.tehtava"
            :is-editing="isEditing"
            :peruste-teksti-avattu="true"
          />
          <hr class="mt-5 mb-4">
        </div>

        <vuosiluokka-sisalto-teksti
          v-if="data.oppiaine.tyyppi === 'yhteinen' && data.vuosiluokkakokonaisuus && data.vuosiluokkakokonaisuus.yleistavoitteet"
          v-model="data.vuosiluokkakokonaisuus.yleistavoitteet"
          :pohja-object="pohjaOppiaineenVuosiluokkakokonaisuus.yleistavoitteet"
          :is-editing="isEditing"
        >
          <template #header>
            <h3 class="mb-3">
              {{ $t('tavoitteet-ja-sisallot') }}
            </h3>
          </template>
        </vuosiluokka-sisalto-teksti>

        <div v-if="!data.oppiaine.koosteinen && data.vuosiluokkakokonaisuus && !isCopyable">
          <div v-if="data.vuosiluokkakokonaisuus && data.vuosiluokkakokonaisuus.vuosiluokat.length > 0">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="mb-0">
                {{ $t('tavoitteet-ja-sisallot-vuosiluokittain') }}
              </h3>
              <router-link
                v-if="!isEditing"
                :to="{name:'perusopetusoppiainevuosiluokkaistaminen'}"
              >
                <ep-button>{{ $t('vuosiluokkaista-tavoitteet') }}</ep-button>
              </router-link>
            </div>

            <div
              v-for="(vuosiluokka,index) in data.vuosiluokkakokonaisuus.vuosiluokat"
              :key="'vuosiluokka'+index"
            >
              <router-link :to="{name:'perusopetusoppiainevuosiluokka', params: {vlId: vuosiluokka.id}}">
                <ep-button variant="link">
                  {{ $t('vuosiluokka') }} {{ $t(vuosiluokka.vuosiluokka) }}
                </ep-button>
              </router-link>
            </div>

            <hr class="mt-5 mb-4">
          </div>

          <div v-if="data.vuosiluokkakokonaisuus.vuosiluokat.length === 0 && !isEditing">
            <div class="ei-tavoitteita mt-3 mb-3">
              {{ $t('tavoitteita-ei-ole-viela-vuosiluokkaistettu') }}
            </div>
            <router-link
              v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'opetussuunnitelma' }"
              :to="{name:'perusopetusoppiainevuosiluokkaistaminen'}"
            >
              <ep-button>{{ $t('vuosiluokkaista-tavoitteet') }}</ep-button>
            </router-link>

            <hr class="mt-5 mb-4">
          </div>
        </div>

        <div v-if="data.vuosiluokkakokonaisuus">
          <vuosiluokka-sisalto-teksti
            v-model="data.vuosiluokkakokonaisuus.tyotavat"
            :peruste-object="perusteenVuosiluokkakokonaisuus.tyotavat"
            :pohja-object="pohjaOppiaineenVuosiluokkakokonaisuus.tyotavat"
            :is-editing="isEditing"
            :peruste-teksti-avattu="true"
          >
            <template #otsikko>
              <h3
                v-if="!perusteenVuosiluokkakokonaisuus.tyotavat"
                class="mb-3"
              >
                {{ $t('oppiaine-osio-tyotavat') }}
              </h3>
            </template>
          </vuosiluokka-sisalto-teksti>
          <hr
            v-if="perusteenVuosiluokkakokonaisuus.tyotavat"
            class="mt-5 mb-4"
          >

          <vuosiluokka-sisalto-teksti
            v-model="data.vuosiluokkakokonaisuus.ohjaus"
            :peruste-object="perusteenVuosiluokkakokonaisuus.ohjaus"
            :pohja-object="pohjaOppiaineenVuosiluokkakokonaisuus.ohjaus"
            :is-editing="isEditing"
            :peruste-teksti-avattu="true"
          >
            <template #otsikko>
              <h3
                v-if="!perusteenVuosiluokkakokonaisuus.ohjaus"
                class="mb-3"
              >
                {{ $t('oppiaine-osio-ohjaus') }}
              </h3>
            </template>
          </vuosiluokka-sisalto-teksti>
          <hr
            v-if="perusteenVuosiluokkakokonaisuus.ohjaus"
            class="mt-5 mb-4"
          >

          <vuosiluokka-sisalto-teksti
            v-model="data.vuosiluokkakokonaisuus.arviointi"
            :peruste-object="perusteenVuosiluokkakokonaisuus.arviointi"
            :pohja-object="pohjaOppiaineenVuosiluokkakokonaisuus.arviointi"
            :is-editing="isEditing"
            :peruste-teksti-avattu="true"
          >
            <template #otsikko>
              <h3
                v-if="!perusteenVuosiluokkakokonaisuus.arviointi"
                class="mb-3"
              >
                {{ $t('arviointi') }}
              </h3>
            </template>
          </vuosiluokka-sisalto-teksti>
        </div>

        <div v-if="data.oppiaine.oppimaarat && data.oppiaine.oppimaarat.length > 0">
          <hr class="mt-5 mb-4">
          <h3 class="mb-3">
            {{ $t('oppimaarat') }}
          </h3>
          <b-table
            striped
            :items="data.oppiaine.oppimaarat"
            :fields="oppimaaratFields"
          >
            <template #cell(nimi)="data">
              <router-link :to="{ name: 'perusopetusoppiaine', params: {vlkId: vlkId,oppiaineId: data.item.id}}">
                {{ $kaanna(data.item.nimi) }}
              </router-link>
            </template>
          </b-table>

          <ep-oppimaara-lisays
            v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"
            :opetussuunnitelma-store="store"
            :oppiaine="data.oppiaine"
            :reset-navi="resetOps"
            button-variant="outline"
          />
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import VuosiluokkaSisaltoTeksti from '../VuosiluokkaSisaltoTeksti.vue';
import { PerusopetusoppiaineStore } from '@/stores/perusopetusoppiaineStore';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpOppimaaraLisays from '@/components/EpOppimaaraLisays/EpOppimaaraLisays.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { isOppiaineUskontoTaiVierasKieli as checkIsOppiaineUskontoTaiVierasKieli } from '@/utils/opetussuunnitelmat';
import { Kielet } from '@shared/stores/kieli';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $bvModal, $kaanna, $t } from '@shared/utils/globals';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Router
const route = useRoute();

// Use composables
const store = computed(() => props.opetussuunnitelmaStore);
const ops = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value);
const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);
const isPohja = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.tyyppi as string === 'pohja');
// Reactive data
const editointiStore = ref<EditointiStore | null>(null);

// Computed properties
const versionumero = computed(() => {
  return route.query.versionumero;
});

const vlkId = computed(() => {
  return route.params.vlkId;
});

const perusteenOppiaine = computed(() => {
  return editointiStore.value?.data.perusteenOppiaine || {};
});

const perusteenOppiaineVapaatTekstit = computed(() => {
  return _.map(editointiStore.value?.data.perusteenOppiaine.vapaatTekstit || {}, pvt => {
    return {
      ...pvt,
      hasPaikallinenTarkennus: _.some(oppiaine.value?.vapaatTekstit, vt => pvt.id === vt.perusteenVapaaTekstiId),
    };
  });
});

const perusteenVuosiluokkakokonaisuus = computed(() => {
  return editointiStore.value?.data.perusteenVuosiluokkakokonaisuus || {};
});

const pohjaOppiaineenVuosiluokkakokonaisuus = computed(() => {
  return editointiStore.value?.data.pohjaOppiaineenVuosiluokkakokonaisuus || {};
});

const oppiaine = computed(() => {
  return editointiStore.value?.data.oppiaine;
});

const oppimaaranOppiaine = computed(() => {
  return _.get(
    _.find(ops.value?.oppiaineet, opsinOppaine => _.includes(_.map(opsinOppaine.oppiaine?.oppimaarat, 'tunniste'), oppiaine.value.tunniste)),
    'oppiaine');
});

const isOppiaineUskontoTaiVierasKieli = computed(() => {
  if (oppimaaranOppiaine.value) {
    return checkIsOppiaineUskontoTaiVierasKieli(oppimaaranOppiaine.value);
  }
  return false;
});

const muokkaa = computed(() => {
  return _.has(route.query, 'muokkaa');
});

const oppimaaratFields = computed(() => {
  return [{
    key: 'nimi',
    thStyle: {
      display: 'none',
    },
  }];
});

// Methods
const lisaaPaikallinenTarkennus = (oppiaine: any, id: any) => {
  if (!oppiaine.vapaatTekstit) {
    oppiaine.vapaatTekstit = [];
  }
  oppiaine.vapaatTekstit.push({
    perusteenVapaaTekstiId: id,
    paikallinenTarkennus: {
      [Kielet.getSisaltoKieli.value]: '',
    },
  });
};

const poistaPaikallinenTarkennus = (oppiaine: any, vapaatekstiId: any) => {
  oppiaine.vapaatTekstit = _.filter(oppiaine.vapaatTekstit, teksti => teksti.perusteenVapaaTekstiId !== vapaatekstiId);
};

const resetOps = async () => {
  await store.value.init();
};

const init = async () => {
  const vuosiluokkakokonaisuus = _.head(_.filter(ops.value?.vuosiluokkakokonaisuudet, vlk =>
    vlk.vuosiluokkakokonaisuus?.id === _.toNumber(route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;

  const parent = _.chain(ops.value?.oppiaineet)
    .map('oppiaine')
    .filter(oppiaine => !_.isEmpty(oppiaine?.oppimaarat))
    .filter(oppiaine => _.some(oppiaine?.oppimaarat, oppimaara => oppimaara.id === _.toNumber(route.params.oppiaineId)))
    .head()
    .value();

  editointiStore.value = new EditointiStore(new PerusopetusoppiaineStore(
    opsId.value,
    _.toNumber(route.params.oppiaineId),
    vuosiluokkakokonaisuus,
    _.toNumber(route.query.versionumero),
    parent,
    resetOps,
    init,
    muokkaa.value));
};

const storeData = computed({
  get: () => {
    return editointiStore.value?.data;
  },
  set: (data: any) => {
    editointiStore.value?.setData(data);
  },
});

const varmistaValutus = async () => {
  if ((ops.value?.joissaPohjana?.length || 0) === 0) {
    return;
  }

  if (!oppimaaranOppiaine.value) {
    return;
  }

  if ((await Oppiaineet.oppimaaraKaytossaKaikissaAlaOpetussuunnitelmissa(opsId.value, oppiaine.value?.id)).data) {
    return;
  }

  const valuta = await $bvModal.msgBoxConfirm($t('vahvista-oppiaineen-tietojen-valutus-teksti'), {
    title: $t('vahvista-oppiaineen-tietojen-valutus-otsikko'),
    okVariant: 'primary',
    okTitle: $t('kylla') as any,
    cancelVariant: 'link',
    cancelTitle: $t('ei') as any,
    centered: true,
    ...{} as any,
  });

  storeData.value = {
    ...storeData.value,
    valuta,
  };
};

// Lifecycle
onMounted(async () => {
  await init();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.ei-tavoitteita {
  font-size: 0.85rem;
  font-style: italic;
  color: $gray-lighten-2;
}

.additional-info-text {
  margin-right: 10px;
  font-weight: 600;
}
</style>
