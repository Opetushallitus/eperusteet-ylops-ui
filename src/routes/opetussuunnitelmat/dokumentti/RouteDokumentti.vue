<template>
  <div class="dokumentit">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">
        {{ $t('luo-pdf') }}
      </h2>
    </div>
    <div class="sisalto">
      <div class="mb-4">
        <h5>{{ $t('luo-ja-lataa-pdf') }}</h5>
        <p>{{ $t('luo-pdf-selite') }}</p>

        <EpPdfDokumentti
          v-if="dtoJulkaisu"
          :dokumentti="dtoJulkaisu"
          :dokumentti-href="hrefJulkaisu"
          :is-polling="false"
          :pdfnimi="$kaanna(opetussuunnitelmanimi)"
        />
        <hr v-if="dtoJulkaisu">
        <EpPdfDokumentti
          :dokumentti="dto"
          :dokumentti-href="href"
          :is-polling="polling"
          :pdfnimi="$kaanna(opetussuunnitelmanimi)"
        />
        <div class="btn-group">
          <ep-button
            :disabled="!dto || polling"
            :show-spinner="polling"
            button-class="px-5"
            @click="createDocument"
          >
            <span>{{ $t('luo-uusi-pdf') }}</span>
          </ep-button>
        </div>
      </div>

      <div class="row">
        <div class="col kuvalataus">
          <EpPdfKuvalataus
            tyyppi="kansikuva"
            :kuva-url="kansikuvaUrl"
            @save-image="saveImage"
            @remove-image="removeImage"
          />
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">
            {{ $t('sijainti') }}
          </div>
          <img src="@assets/img/icons/pdfkuva_etusivu.svg">
        </div>
      </div>

      <div class="row">
        <div class="col kuvalataus">
          <EpPdfKuvalataus
            tyyppi="ylatunniste"
            :kuva-url="ylatunnisteUrl"
            @save-image="saveImage"
            @remove-image="removeImage"
          />
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">
&nbsp;
          </div>
          <img src="@assets/img/icons/pdfkuva_header.svg">
        </div>
      </div>

      <div class="row">
        <div class="col kuvalataus">
          <EpPdfKuvalataus
            tyyppi="alatunniste"
            :kuva-url="alatunnisteUrl"
            @save-image="saveImage"
            @remove-image="removeImage"
          />
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">
&nbsp;
          </div>
          <img src="@assets/img/icons/pdfkuva_alatunniste.svg">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import _ from 'lodash';
import { baseURL, Dokumentit, DokumentitParams, DokumenttiDto, DokumenttiDtoTilaEnum } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { debounced } from '@shared/utils/delay';
import { DokumenttiKuvaDto } from '@shared/generated/ylops';
import EpPdfDokumentti from '@shared/components/EpPdfLuonti/EpPdfDokumentti.vue';
import EpPdfKuvalataus from '@shared/components/EpTiedosto/EpPdfKuvalataus.vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $fail, $kaanna, $success, $t } from '@shared/utils/globals';
import { Koulutustyyppi } from '@shared/tyypit';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Use the composable
const ops = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value);
const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);
// Reactive data
const previewUrl = ref(null);
const dto = ref<DokumenttiDto | null>(null);
const dtoJulkaisu = ref<DokumenttiDto | null>(null);
const dtoKuva = ref<DokumenttiKuvaDto | null>(null);
const href = ref<string | null>(null);
const hrefJulkaisu = ref<string | null>(null);
const polling = ref(false);

// Computed properties
const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const infoClass = computed(() => {
  if (dto.value && href.value) {
    return 'luotu';
  }

  if (dto.value && dto.value.tila === _.toLower(DokumenttiDtoTilaEnum.EPAONNISTUI)) {
    return 'epaonnistui';
  }

  return 'ei-luotu';
});

const tilaFormatted = computed(() => {
  if (dto.value) {
    // Note: $sdt is a global utility that may need to be imported
    return $t('dokumentti-' + _.kebabCase(dto.value.tila), {
      valmistumisaika: dto.value.valmistumisaika ? new Date(dto.value.valmistumisaika).toLocaleString() : null,
    });
  }
  else {
    return $t('dokumentti-' + _.kebabCase(DokumenttiDtoTilaEnum.EIOLE));
  }
});

const opetussuunnitelmanimi = computed(() => {
  return ops.value?.nimi;
});

const kansikuvaUrl = computed(() => {
  return dtoKuva.value?.kansikuva ? haeKuva('kansikuva') : '';
});

const ylatunnisteUrl = computed(() => {
  return dtoKuva.value?.ylatunniste ? haeKuva('ylatunniste') : '';
});

const alatunnisteUrl = computed(() => {
  return dtoKuva.value?.alatunniste ? haeKuva('alatunniste') : '';
});

const tyoversioKesken = computed(() => {
  return !!dto.value && (_.kebabCase(dto.value?.tila) === _.kebabCase(DokumenttiDtoTilaEnum.JONOSSA) || _.kebabCase(dto.value?.tila) === _.kebabCase(DokumenttiDtoTilaEnum.LUODAAN));
});

const julkaisuKesken = computed(() => {
  return !!dtoJulkaisu.value && (_.kebabCase(dtoJulkaisu.value?.tila) === _.kebabCase(DokumenttiDtoTilaEnum.JONOSSA) || _.kebabCase(dtoJulkaisu.value?.tila) === _.kebabCase(DokumenttiDtoTilaEnum.LUODAAN));
});

// Methods
const haeKuva = (tyyppi: string) => {
  return baseURL + DokumentitParams.getImage(dto.value!.opsId!, tyyppi, kieli.value).url;
};

// Alustetaan komponentti
const init = async () => {
  previewUrl.value = null;
  dto.value = null;
  dtoJulkaisu.value = null;
  dtoKuva.value = null;
  href.value = null;

  if (opsId.value) {
    await getDokumenttiTila();
  }

  // Haetaan kuvaliitteet
  const resKuva = await Dokumentit.getDokumenttiKuva(opsId.value, kieli.value);
  dtoKuva.value = resKuva.data;
};

// Haetaan dokumentin tila ja päivitetään muuttujat
// Note: Debounced decorator needs to be replaced with debounce utility
const getDokumenttiTila = debounced(async () => {
  await getDokumentti();
  if (!dto.value?.julkaisuDokumentti) {
    await getJulkaistuDokumentti();
  }
  await handleTilaPolling();
}, 2000);

const getJulkaistuDokumentti = async () => {
  dtoJulkaisu.value = (await Dokumentit.getJulkaistuDokumentti(opsId.value, kieli.value)).data;
  if (dtoJulkaisu.value.id && _.kebabCase(dtoJulkaisu.value?.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS)) {
    hrefJulkaisu.value = baseURL + DokumentitParams.get(_.toString(dtoJulkaisu.value.id)).url;
  }
};

const getDokumentti = async () => {
  dto.value = (await Dokumentit.getLatestDokumentti(opsId.value, kieli.value)).data;
  if (dto.value.id && _.kebabCase(dto.value?.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS)) {
    href.value = baseURL + DokumentitParams.get(_.toString(dto.value.id)).url;
  }

  if (_.kebabCase(dto.value.tila) === _.kebabCase(DokumenttiDtoTilaEnum.EPAONNISTUI)) {
    $fail('pdf-tiedosto-luonti-epaonnistui');
  }
};

const handleTilaPolling = async () => {
  if (tyoversioKesken.value || julkaisuKesken.value) {
    polling.value = true;
    await getDokumenttiTila();
  }
  else {
    polling.value = false;
  }
};

// Luodaan uusi dokumentti
const createDocument = async () => {
  try {
    polling.value = true;
    dto.value = (await Dokumentit.create(opsId.value, kieli.value)).data;
    await getDokumenttiTila();
  }
  catch (e) {
    polling.value = false;
  }
};

// Tallennetaan uusi kansikuva
const saveImage = async (file: File, tyyppi: string) => {
  if (file) {
    dtoKuva.value = (await Dokumentit.addImage(opsId.value, tyyppi, kieli.value, file)).data;
    $success('pdf-tiedosto-kuva-lataus-onnistui');
  }
};

// Poistetaan kansikuva
const removeImage = async (tyyppi: string) => {
  await Dokumentit.deleteImage(opsId.value, tyyppi, kieli.value);
  $success('pdf-tiedosto-kuva-poisto-onnistui');
  if (dtoKuva.value) {
    dtoKuva.value[tyyppi] = undefined;
  }
};

// Watchers
watch(kieli, () => {
  init();
});

// Lifecycle
onMounted(async () => {
  await init();
});

</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.dokumentit {
  margin-top: 4px;

  .ylapaneeli {
    border-bottom: 1px solid #eee;
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    height: 50px;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    margin: 35px 50px 20px 15px;

    .pdf-box {
      margin: 25px 0px;
      width: 100%;
      border-radius: 2px;
      padding: 25px;

      .ikoni {
        font-size: 1.5rem;
      }

      &.luotu {
        background-color: $gray-lighten-10;

        .ikoni {
          color: $blue-lighten-6;
        }

        @media(max-width: 575px) {

          .ikoni {
            display: none;
          }
        }

        .teksti {
          font-weight: 600;
        }
      }

      &.ei-luotu {
        border: 1px solid $gray-lighten-9;
        color: $gray-lighten-2;
        font-style: italic;
      }

      &.epaonnistui {
        border: 1px solid $gray-lighten-9;
        color: $red;
      }

    }

    @media(max-width: 575px) {

      .sijaintikuva {
        display:none;
      }

    }

    .kuvalataus {
      min-width: 300px;
    }

    .sijainti-topic {
      font-weight: 600;
    }

  }
}

</style>
