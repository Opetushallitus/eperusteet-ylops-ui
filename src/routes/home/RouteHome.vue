<template>
  <div>
    <Teleport
      defer
      to="#headerExtension"
    >
      <div class="container">
        <div class="container-fluid">
          <div class="flex flex-wrap -mx-0">
            <div class="flex-1 min-w-0 my-4 px-3 md:px-0">
              <h1>{{ $t('lops-tyokalu-tervetuloa', {nimi }) }}</h1>
              <p>{{ $t('ylops-tervetuloa-kuvaus') }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="container tile-container">
      <div class="flex flex-wrap justify-center">
        <tile-opetussuunnitelmat
          :keskeneraiset="etusivu.opetussuunnitelmatKeskeneraiset"
          :julkaistut="etusivu.opetussuunnitelmatJulkaistut"
          :count-is-loading="isLoading"
        />
        <tile-opetussuunnitelmat
          v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'pohja' }"
          :keskeneraiset="etusivu.pohjatKeskeneraiset"
          :julkaistut="etusivu.pohjatJulkaistut"
          :is-ops="false"
          :count-is-loading="isLoading"
        />
        <tile-organisaatio />
        <tile-valtakunnalliset-perusteet />
        <tile-tiedotteet />
        <tile-ukk />
        <tile-oppaat />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { KayttajaStore, Kayttajat } from '@/stores/kayttaja';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { EtusivuDto } from '@shared/api/ylops';
import { onMounted } from 'vue';
import TileUkk from './tiles/TileUkk.vue';
import TileOpetussuunnitelmat from './tiles/TileOpetussuunnitelmat.vue';
import TileValtakunnallisetPerusteet from './tiles/TileValtakunnallisetPerusteet.vue';
import TileOrganisaatio from './tiles/TileOrganisaatio.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';
import TileOppaat from './tiles/TileOppaat.vue';

const props = defineProps<{
  kayttajaStore: KayttajaStore;
}>();

const isLoading = ref(true);
const rajain = ref('');
const etusivu = ref<EtusivuDto>({
  opetussuunnitelmatKeskeneraiset: 0,
  opetussuunnitelmatJulkaistut: 0,
  pohjatKeskeneraiset: 0,
  pohjatJulkaistut: 0,
});

onMounted(async () => {
  isLoading.value = true;
  etusivu.value = await Kayttajat.getEtusivu();
  isLoading.value = false;
});

const nimi = computed(() => kayttajaStore.value.nimi.value || null);

const kayttajaStore = computed(() => props.kayttajaStore);

const kayttaja = computed(() => Kayttajat.tiedot);
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.home-container {
  .header {
    h1 {
      font-weight: 300;
    }
  }

  .tile-container {
    margin-top: 50px;
  }
}
</style>
