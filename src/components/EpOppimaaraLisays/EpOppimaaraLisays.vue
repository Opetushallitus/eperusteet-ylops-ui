<template>
  <div>
    <EpButton
      icon="add"
      :variant="buttonVariant"
      button-class="text-decoration-none"
      no-padding
      @click="openModal()"
    >
      <span>{{ $t(addButtonText) }}</span>
    </EpButton>
    <EpModal
      ref="oppimaaralisaysModal"
      size="lg"
      @cancel="clear"
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

      <template #modal-footer>
        <EpButton
          variant="link"
          :disabled="saving"
          @click="cancel"
        >
          {{ $t('peruuta') }}
        </EpButton>
        <EpButton
          variant="primary"
          :disabled="okDisabled || saving"
          :show-spinner="saving"
          @click="save"
        >
          {{ $t(addText) }}
        </EpButton>
      </template>
    </EpModal>
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
import EpModal from '@shared/components/EpModal/EpModal.vue';

import { OppiaineSuppeaDto, Oppiaineet, PerusteOppiaineDto, KopioOppimaaraDto, UnwrappedOpsVuosiluokkakokonaisuusDto, Vuosiluokkakokonaisuudet } from '@shared/api/ylops';
import { Kielet, UiKielet } from '@shared/stores/kieli';

import { $t, $kaanna, $fail } from '@shared/utils/globals';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { onMounted } from 'vue';

const props = withDefaults(
  defineProps<{
    buttonVariant?: string;
    opetussuunnitelmaStore: OpetussuunnitelmaStore;
    oppiaineId: number;
  }>(), {
    buttonVariant: 'link',
  });

const route = useRoute();
const router = useRouter();

const oppimaaralisaysModal = useTemplateRef('oppimaaralisaysModal');

const perusteenOppiaine = ref<PerusteOppiaineDto | null>(null);
const vuosiluokkakokonaisuus = ref<UnwrappedOpsVuosiluokkakokonaisuusDto | null>(null);
const nimi = ref<object | null>(null);
const valittuOppimaara = ref<OppiaineSuppeaDto | null>(null);
const oppiaine = ref<OppiaineSuppeaDto | null>(null);
const saving = ref(false);

const opsId = computed(() => {
  return props.opetussuunnitelmaStore.opetussuunnitelma.value?.id;
});

const ops = computed(() => {
  return props.opetussuunnitelmaStore.opetussuunnitelma.value;
});

const addText = computed(() => {
  return isUskonto.value ? 'lisaa-muu-uskonto' : 'lisaa-kielitarjonta';
});

const addButtonText = computed(() => {
  return isUskonto.value ? 'lisaa-uskonnon-oppimaara' : 'lisaa-kielitarjonta';
});

const isUskonto = computed(() => {
  return oppiaine.value?.koodiArvo === 'KT';
});

const isKieli = computed(() => {
  return _.includes(['VK', 'TK'], oppiaine.value?.koodiArvo);
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

const $v = useVuelidate(validationRules, { valittuOppimaara, nimi }, { $stopPropagation: true });

const okDisabled = computed(() => {
  return $v.value.$invalid;
});

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

const loadModalData = async () => {
  oppiaine.value = _.get(_.find(ops.value?.oppiaineet, oa => oa.oppiaine.id === props.oppiaineId), 'oppiaine');
  perusteenOppiaine.value = (await Oppiaineet.getPerusteSisalto(opsId.value, (oppiaine.value?.id as number))).data;
  vuosiluokkakokonaisuus.value = (await Vuosiluokkakokonaisuudet.getVuosiluokkakokonaisuus(opsId.value, _.toNumber(route.params.vlkId))).data;
};

const openModal = async () => {
  await loadModalData();
  oppimaaralisaysModal.value?.show();
};

const cancel = () => {
  clear();
  oppimaaralisaysModal.value?.hide();
};

const save = async () => {
  saving.value = true;
  const kopio = {
    omaNimi: nimi.value as { [key: string]: string; },
    tunniste: valittuOppimaara.value?.tunniste,
  } as KopioOppimaaraDto;

  try {
    const uusi = (await Oppiaineet.addOppimaara((ops.value!.id as number), (oppiaine.value?.id as number), kopio)).data;
    await props.opetussuunnitelmaStore.initNavigation();
    oppimaaralisaysModal.value?.hide();

    router.push({
      name: 'perusopetusoppiaine',
      params: {
        ...route.params,
        oppiaineId: '' + uusi.id,
        vlkId: route.params.vlkId,
      },
    });
  }
  catch (err: any) {
    $fail($t('tallennus-epaonnistui') as string);
    $fail(err.response.data.syy);
  }
  finally {
    saving.value = false;
  }
};

const clear = () => {
  valittuOppimaara.value = null;
};

onMounted(() => {
  oppiaine.value = _.get(_.find(ops.value?.oppiaineet, oa => oa.oppiaine.id === props.oppiaineId), 'oppiaine');
});

</script>

<style scoped lang="scss">

  :deep(.ep-button) {

    .teksti {
      padding-left: 0px !important;
    }
  }

</style>
