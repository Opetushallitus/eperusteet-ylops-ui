<template>
  <div>
    <ep-button
      icon="add"
      :variant="buttonVariant"
      button-class="text-decoration-none"
      @click="openModal()"
    >
      <span>{{ $t(addButtonText) }}</span>
    </ep-button>
    <b-modal
      id="oppimaaralisays"
      ref="oppimaaralisaysModal"
      size="lg"
      centered
      :ok-disabled="okDisabled"
      static
      lazy
      @hidden="clear"
      @show="show"
      @ok="save"
    >
      <template #modal-title>
        {{ $t(addText) }}
      </template>

      <div>{{ $t('oppimaara-lisays-modal-selite') }}</div>

      <ep-form-content
        :show-header="false"
        class="mt-4"
      >
        <h3>{{ $kaanna(oppiaine.nimi) }}</h3>
        <ep-select
          v-model="valittuOppimaara"
          class="mb-5"
          :items="oppimaaratTyhjalla"
          :is-editing="true"
          :enable-empty-option="true"
        >
          <template #default="{ item }">
            {{ $kaanna(item.nimi) }}
          </template>
        </ep-select>
      </ep-form-content>

      <ep-form-content
        v-if="valittuOppimaara && (isKieli || valittuOppimaara.tyhjanimi)"
        name="nimi"
      >
        <ep-field
          v-model="nimi"
          class="mb-5"
          :is-editing="true"
          :validation="$v.nimi"
        />
      </ep-form-content>

      <template #modal-cancel>
        {{ $t('peruuta') }}
      </template>
      <template #modal-ok>
        {{ $t(addText) }}
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';

import { OppiaineSuppeaDto, Oppiaineet, PerusteOppiaineDto, KopioOppimaaraDto, UnwrappedOpsVuosiluokkakokonaisuusDto, Vuosiluokkakokonaisuudet } from '@shared/api/ylops';
import { Kielet, UiKielet } from '@shared/stores/kieli';

import { $t, $kaanna, $fail } from '@shared/utils/globals';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

const props = withDefaults(
  defineProps<{
    oppiaine: OppiaineSuppeaDto;
    resetNavi: () => Promise<void>;
    buttonVariant?: string;
    opetussuunnitelmaStore: OpetussuunnitelmaStore;
  }>(), {
    buttonVariant: 'link',
  });

const route = useRoute();
const router = useRouter();

// Template refs
const oppimaaralisaysModal = useTemplateRef('oppimaaralisaysModal');

// Reactive data
const perusteenOppiaine = ref<PerusteOppiaineDto | null>(null);
const vuosiluokkakokonaisuus = ref<UnwrappedOpsVuosiluokkakokonaisuusDto | null>(null);
const nimi = ref<object | null>(null);
const valittuOppimaara = ref<OppiaineSuppeaDto | null>(null);

const opsId = computed(() => {
  return props.opetussuunnitelmaStore.opetussuunnitelma.value?.id;
});

const ops = computed(() => {
  return props.opetussuunnitelmaStore.opetussuunnitelma.value;
});

// Computed properties
const addText = computed(() => {
  return isUskonto.value ? 'lisaa-muu-uskonto' : 'lisaa-kielitarjonta';
});

const addButtonText = computed(() => {
  return isUskonto.value ? 'lisaa-uskonnon-oppimaara' : 'lisaa-kielitarjonta';
});

const isUskonto = computed(() => {
  return props.oppiaine.koodiArvo === 'KT';
});

const isKieli = computed(() => {
  return _.includes(['VK', 'TK'], props.oppiaine.koodiArvo);
});

const muuUskontoNimi = computed(() => {
  let nimiObj = {};
  Object.assign(nimiObj, ..._.map(UiKielet, kieli => {
    return {
      [kieli]: $t('muu-uskonto'),
    };
  }));
  return nimiObj;
});

const oppimaarat = computed(() => {
  if (perusteenOppiaine.value) {
    return _.chain(perusteenOppiaine.value.oppimaarat)
      .filter(oppimaara => _.includes(_.map(oppimaara?.vuosiluokkakokonaisuudet, '_vuosiluokkakokonaisuus'), _.get(vuosiluokkakokonaisuus.value, '_tunniste')))
      .sortBy('koodiUri')
      .value();
  }

  return undefined;
});

const oppimaaratTyhjalla = computed(() => {
  if (perusteenOppiaine.value) {
    if (isUskonto.value) {
      return [
        {
          nimi: muuUskontoNimi.value,
          tyhjanimi: true,
        },
        ...(oppimaarat.value as PerusteOppiaineDto[]),
      ];
    }
    else {
      return oppimaarat.value;
    }
  }

  return undefined;
});

// Validation setup
const validationRules = computed(() => ({
  valittuOppimaara: {
    required,
  },
  nimi: {
    [Kielet.getSisaltoKieli.value]: {
      required,
    },
  },
}));

const $v = useVuelidate(validationRules, { valittuOppimaara, nimi });

const okDisabled = computed(() => {
  return $v.value.$invalid;
});

// Watchers
watch(valittuOppimaara, (val) => {
  if (val) {
    if (val.tyhjanimi) {
      nimi.value = {};
    }
    else {
      nimi.value = val.nimi;
    }
  }
});

// Methods
const openModal = () => {
  oppimaaralisaysModal.value?.show();
};

const show = async () => {
  perusteenOppiaine.value = (await Oppiaineet.getPerusteSisalto(opsId.value, (props.oppiaine.id as number))).data;
  vuosiluokkakokonaisuus.value = (await Vuosiluokkakokonaisuudet.getVuosiluokkakokonaisuus(opsId.value, _.toNumber(route.params.vlkId))).data;
};

const save = async () => {
  const kopio = {
    omaNimi: nimi.value as { [key: string]: string; },
    tunniste: valittuOppimaara.value?.tunniste,
  } as KopioOppimaaraDto;

  try {
    const uusi = (await Oppiaineet.addOppimaara((ops.value.id as number), (props.oppiaine.id as number), kopio)).data;

    await props.resetNavi();

    router.push({
      name: 'perusopetusoppiaine',
      params: {
        ...route.params,
        oppiaineId: '' + uusi.id,
      },
    });
  }
  catch (err: any) {
    $fail($t('tallennus-epaonnistui') as string);
    $fail(err.response.data.syy);
  }
};

const clear = () => {
  valittuOppimaara.value = null;
};
</script>

<style scoped lang="scss">

  :deep(.ep-button) {

    .teksti {
      padding-left: 0px !important;
    }
  }

</style>
