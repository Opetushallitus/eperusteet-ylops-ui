<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi
      :store="editointiStore"
      :confirmCopy="false">
      <template v-slot:kopioi-teksti>{{ $t('muokkaa') }}</template>
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.vlk.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, supportData }">
        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.tehtava"
                                    :pohjaObject="supportData.pohjanVlk.tehtava"
                                    :vlkObject="data.vlk.tehtava"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />

        <template v-if="data.perusteenVlk.vapaatTekstit">
          <ep-collapse class="mt-4"
                       tyyppi="perusteteksti"
                       :border-bottom="false"
                       :border-top="true"
                       :expanded-by-default="true"
                       v-for="(vapaateksti, index) in perusteenVlkVapaatTekstit"
                       :key="'perustevapaateksti' + index">

            <template v-slot:header><h4>{{$kaanna(vapaateksti.nimi)}}</h4></template>
            <span v-html="$kaanna(vapaateksti.teksti)"></span>

            <h4 class="mt-4">{{ $t('paikallinen-teksti') }}</h4>
            <EpButton v-if="isEditing && !vapaateksti.hasPaikallinenTarkennus"
                      icon="add"
                      @click="lisaaPaikallinenTarkennus(data.vlk, vapaateksti.id)"
                      variant="link"
                      class="mb-1">
              {{ $t('lisaa-paikallinen-tarkennus') }}
            </EpButton>
            <EpAlert v-if="!isEditing && !vapaateksti.hasPaikallinenTarkennus" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />

            <div v-for="(teksti, index) in data.vlk.vapaatTekstit" :key="'teksti'+index">
              <div v-if="vapaateksti.id === teksti.perusteenVapaaTekstiId">
                <EpContent v-model="teksti.paikallinenTarkennus"
                           layout="normal"
                           :is-editable="isEditing"></EpContent>

                <EpButton v-if="isEditing"
                          @click="poistaPaikallinenTarkennus(data.vlk, vapaateksti.id)"
                          variant="link"
                          icon="delete">
                  {{ $t('poista-paikallinen-tarkennus') }}
                </EpButton>
              </div>

            </div>
          </ep-collapse>
        </template>

        <hr/>
        <h2>{{$t('siirtymavaiheet')}}</h2>

        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.siirtymaEdellisesta"
                                    :pohjaObject="supportData.pohjanVlk.siirtymaEdellisesta"
                                    :vlkObject="data.vlk.siirtymaEdellisesta"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />
        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.siirtymaSeuraavaan"
                                    :pohjaObject="supportData.pohjanVlk.siirtymaSeuraavaan"
                                    :vlkObject="data.vlk.siirtymaSeuraavaan"
                                    :isEditing="isEditing"
                                    :peruste-teksti-avattu="true" />

        <hr/>
        <h2>{{$t('laaja-alainen-osaaminen')}}</h2>

        <vuosiluokka-sisalto-teksti :perusteObject="data.perusteenVlk.laajaalainenOsaaminen" :isEditing="false" />

        <hr/>
        <h2>{{$t('laaja-alaisen-osaamisen-alueet')}}</h2>

        <div v-for="(laajaalainen, index) in data.laajaalaiset" :key="'laajaalainen' + index" class="mb-5">
          <h3>{{ $kaanna(laajaalainen.nimi) }}</h3>

          <ep-collapse tyyppi="perusteteksti" :border-bottom="false" :border-top="false" chevronLocation="left" :usePadding="false" v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenPaatasonLao" class="mb-4">
            <template #header>
              <div class="link-style">{{ $t('laaja-alaisen-osaamisen-alueen-yleiskuvaus')}}</div>
            </template>

            <EpToggle class="mb-2" v-if="isEditing" v-model="data.vlk.laajaalaisetosaamiset[index].naytaPerusteenPaatasonLao">{{$t('nayta-laaja-alaisen-osaamisen-alueen-yleiskuvaus')}}</EpToggle>
            <ep-content v-model="laajaalainen.kuvaus" layout="normal" v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenPaatasonLao" />

          </ep-collapse>

          <ep-collapse tyyppi="perusteteksti" :border-bottom="false" :border-top="false" chevronLocation="left" :usePadding="false" v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenVlkTarkennettuLao" class="mb-4">
            <template #header>
              <div class="link-style">{{ $t('laaja-alaisen-osaamisen-alueen-vuosiluokkakokonaisuuden-kuvaus')}}</div>
            </template>

            <EpToggle class="mb-2" v-if="isEditing" v-model="data.vlk.laajaalaisetosaamiset[index].naytaPerusteenVlkTarkennettuLao">{{$t('nayta-laaja-alaisen-osaamisen-alueen-vuosiluokkakokonaisuuden-kuvaus')}}</EpToggle>
            <ep-content v-if="perusteenVlkByLaoTunniste[laajaalainen.tunniste] && (isEditing || data.vlk.laajaalaisetosaamiset[index].naytaPerusteenVlkTarkennettuLao)"
              v-model="perusteenVlkByLaoTunniste[laajaalainen.tunniste].kuvaus" layout="normal"/>
          </ep-collapse>

          <ep-collapse
            v-if="supportData.pohjanLaajaAlaisetOsaamiset[data.vlk.laajaalaisetosaamiset[index]['_laajaalainenosaaminen']] && supportData.pohjanLaajaAlaisetOsaamiset[data.vlk.laajaalaisetosaamiset[index]['_laajaalainenosaaminen']].kuvaus"
            class="mb-4"
            :use-padding="false"
            tyyppi="pohjateksti"
            :border-bottom="false"
            :border-top="false">
            <template v-slot:header><h4>{{$t('pohjan-teksti')}}</h4></template>
            <span v-html="$kaanna(supportData.pohjanLaajaAlaisetOsaamiset[data.vlk.laajaalaisetosaamiset[index]['_laajaalainenosaaminen']].kuvaus)"></span>
          </ep-collapse>

          <h4>{{ $t('paikallinen-teksti') }}</h4>
          <ep-content v-if="isEditing || data.vlk.laajaalaisetosaamiset[index].kuvaus" v-model="data.vlk.laajaalaisetosaamiset[index].kuvaus" layout="normal" :is-editable="isEditing"/>
          <ep-alert v-if="!isEditing && !data.vlk.laajaalaisetosaamiset[index].kuvaus" :text="$t('paikallista-sisaltoa-ei-maaritetty')" />

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
import { useEpOpsComponent } from '@/mixins/EpOpsComponent';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $kaanna, $t } from '@shared/utils/globals';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Use composables
const route = useRoute();
const { store, opsId } = useEpOpsComponent(props.opetussuunnitelmaStore);

// Component state
const editointiStore = ref<EditointiStore | null>(null);

// Computed properties
const vlk = computed(() => {
  return editointiStore.value?.data.value.vlk;
});

const perusteenVlkVapaatTekstit = computed(() => {
  return _.map(editointiStore.value?.data.value.perusteenVlk.vapaatTekstit || {}, vlkVt => {
    return {
      ...vlkVt,
      hasPaikallinenTarkennus: _.some(vlk.value?.vapaatTekstit, vt => vlkVt.id === vt.perusteenVapaaTekstiId),
    };
  });
});

const perusteenVlkByLaoTunniste = computed(() => {
  return _.keyBy(editointiStore.value?.data.value.perusteenVlk.laajaalaisetosaamiset, '_laajaalainenosaaminen');
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
