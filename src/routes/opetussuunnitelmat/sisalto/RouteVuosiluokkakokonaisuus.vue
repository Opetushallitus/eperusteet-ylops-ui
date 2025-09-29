<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :confirm-copy="false"
    >
      <template #kopioi-teksti>
        {{ $t('muokkaa') }}
      </template>
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.vlk.nimi) }}
        </h2>
      </template>
      <template #default="{ data, isEditing, supportData }">
        <vuosiluokka-sisalto-teksti
          v-model="data.vlk.tehtava"
          :peruste-object="data.perusteenVlk.tehtava"
          :pohja-object="supportData.pohjanVlk.tehtava"
          :is-editing="isEditing"
          :peruste-teksti-avattu="true"
        />

        <template v-if="data.perusteenVlk.vapaatTekstit">
          <ep-collapse
            v-for="(vapaateksti, index) in perusteenVlkVapaatTekstit"
            :key="'perustevapaateksti' + index"
            class="mt-4"
            tyyppi="perusteteksti"
            :border-bottom="false"
            :border-top="true"
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
              @click="lisaaPaikallinenTarkennus(data.vlk, vapaateksti.id)"
            >
              {{ $t('lisaa-paikallinen-tarkennus') }}
            </EpButton>
            <EpAlert
              v-if="!isEditing && !vapaateksti.hasPaikallinenTarkennus"
              :text="$t('paikallista-sisaltoa-ei-maaritetty')"
            />

            <div
              v-for="(teksti, index) in data.vlk.vapaatTekstit"
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
                  @click="poistaPaikallinenTarkennus(data.vlk, vapaateksti.id)"
                >
                  {{ $t('poista-paikallinen-tarkennus') }}
                </EpButton>
              </div>
            </div>
          </ep-collapse>
        </template>

        <hr>
        <h2>{{ $t('siirtymavaiheet') }}</h2>

        <vuosiluokka-sisalto-teksti
          v-model="data.vlk.siirtymaEdellisesta"
          :peruste-object="data.perusteenVlk.siirtymaEdellisesta"
          :pohja-object="supportData.pohjanVlk.siirtymaEdellisesta"
          :is-editing="isEditing"
          :peruste-teksti-avattu="true"
        />
        <vuosiluokka-sisalto-teksti
          v-model="data.vlk.siirtymaSeuraavaan"
          :peruste-object="data.perusteenVlk.siirtymaSeuraavaan"
          :pohja-object="supportData.pohjanVlk.siirtymaSeuraavaan"
          :is-editing="isEditing"
          :peruste-teksti-avattu="true"
        />

        <hr>
        <h2>{{ $t('laaja-alainen-osaaminen') }}</h2>

        <vuosiluokka-sisalto-teksti
          :peruste-object="data.perusteenVlk.laajaalainenOsaaminen"
          :is-editing="false"
        />

        <hr>
        <h2>{{ $t('laaja-alaisen-osaamisen-alueet') }}</h2>

        <div
          v-for="(laajaalainen, index) in data.laajaalaiset"
          :key="'laajaalainen' + index"
          class="mb-5"
        >
          <h3>{{ $kaanna(laajaalainen.nimi) }}</h3>

          <ep-collapse
            v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenPaatasonLao"
            tyyppi="perusteteksti"
            :border-bottom="false"
            :border-top="false"
            chevron-location="left"
            :use-padding="false"
            class="mb-4"
          >
            <template #header>
              <div class="link-style">
                {{ $t('laaja-alaisen-osaamisen-alueen-yleiskuvaus') }}
              </div>
            </template>

            <EpToggle
              v-if="isEditing"
              v-model="data.vlk.laajaalaisetosaamiset[index].naytaPerusteenPaatasonLao"
              class="mb-2"
            >
              {{ $t('nayta-laaja-alaisen-osaamisen-alueen-yleiskuvaus') }}
            </EpToggle>
            <ep-content
              v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenPaatasonLao"
              v-model="laajaalainen.kuvaus"
              layout="normal"
            />
          </ep-collapse>

          <ep-collapse
            v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenVlkTarkennettuLao"
            tyyppi="perusteteksti"
            :border-bottom="false"
            :border-top="false"
            chevron-location="left"
            :use-padding="false"
            class="mb-4"
          >
            <template #header>
              <div class="link-style">
                {{ $t('laaja-alaisen-osaamisen-alueen-vuosiluokkakokonaisuuden-kuvaus') }}
              </div>
            </template>

            <EpToggle
              v-if="isEditing"
              v-model="data.vlk.laajaalaisetosaamiset[index].naytaPerusteenVlkTarkennettuLao"
              class="mb-2"
            >
              {{ $t('nayta-laaja-alaisen-osaamisen-alueen-vuosiluokkakokonaisuuden-kuvaus') }}
            </EpToggle>
            <ep-content
              v-if="perusteenVlkByLaoTunniste[laajaalainen.tunniste] && (isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenVlkTarkennettuLao)"
              v-model="perusteenVlkByLaoTunniste[laajaalainen.tunniste].kuvaus"
              layout="normal"
            />
          </ep-collapse>

          <ep-collapse
            v-if="supportData.pohjanLaajaAlaisetOsaamiset[data.vlk.laajaalaisetosaamiset[index]['_laajaalainenosaaminen']] && supportData.pohjanLaajaAlaisetOsaamiset[data.vlk.laajaalaisetosaamiset[index]['_laajaalainenosaaminen']].kuvaus"
            class="mb-4"
            :use-padding="false"
            tyyppi="pohjateksti"
            :border-bottom="false"
            :border-top="false"
          >
            <template #header>
              <h4>{{ $t('pohjan-teksti') }}</h4>
            </template>
            <span v-html="$kaanna(supportData.pohjanLaajaAlaisetOsaamiset[data.vlk.laajaalaisetosaamiset[index]['_laajaalainenosaaminen']].kuvaus)" />
          </ep-collapse>

          <h4>{{ $t('paikallinen-teksti') }}</h4>
          <ep-content
            v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].kuvaus"
            v-model="data.vlk.laajaalaisetosaamiset[index].kuvaus"
            layout="normal"
            :is-editable="isEditing"
          />
          <ep-alert
            v-if="!isEditing && !data.vlk.laajaalaisetosaamiset[index].kuvaus"
            :text="$t('paikallista-sisaltoa-ei-maaritetty')"
          />
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import VuosiluokkaSisaltoTeksti from './VuosiluokkaSisaltoTeksti.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { VuosiluokkakokonaisuusStore } from '@/stores/vuosiluokkakokonaisuusStore';
import { Kielet } from '@shared/stores/kieli';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $kaanna, $t } from '@shared/utils/globals';
import EpToggle from '@shared/components/forms/EpToggle.vue';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Use composables
const route = useRoute();
const store = computed(() => props.opetussuunnitelmaStore);
const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);

// Component state
const editointiStore = ref<EditointiStore | null>(null);

// Computed properties
const vlk = computed(() => {
  return editointiStore.value?.data.vlk;
});

const perusteenVlkVapaatTekstit = computed(() => {
  return _.map(editointiStore.value?.data.perusteenVlk.vapaatTekstit || {}, vlkVt => {
    return {
      ...vlkVt,
      hasPaikallinenTarkennus: _.some(vlk.value?.vapaatTekstit, vt => vlkVt.id === vt.perusteenVapaaTekstiId),
    };
  });
});

const perusteenVlkByLaoTunniste = computed(() => {
  return _.keyBy(editointiStore.value?.data.perusteenVlk.laajaalaisetosaamiset, '_laajaalainenosaaminen');
});

const muokkaa = computed(() => {
  return _.has(route.query, 'muokkaa');
});

// Methods
const init = async () => {
  const scrollId = route.hash ? 'laajaalainen' + route.hash.replace('#', '') : null;
  const componentRef = { resetOps };
  editointiStore.value = new EditointiStore(new VuosiluokkakokonaisuusStore(opsId.value, _.toNumber(route.params.vlkId), scrollId, componentRef, muokkaa.value));
};

const resetOps = async () => {
  await store.value.init();
};

const lisaaPaikallinenTarkennus = (vlkParam, id) => {
  if (!vlkParam.vapaatTekstit) {
    vlkParam.vapaatTekstit = [];
  }
  vlkParam.vapaatTekstit.push({
    perusteenVapaaTekstiId: id,
    paikallinenTarkennus: {
      [Kielet.getSisaltoKieli.value]: '',
    },
  });
};

const poistaPaikallinenTarkennus = (vlkParam, vapaatekstiId) => {
  vlkParam.vapaatTekstit = _.filter(vlkParam.vapaatTekstit, teksti => teksti.perusteenVapaaTekstiId !== vapaatekstiId);
};

// Lifecycle
onMounted(async () => {
  await init();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
