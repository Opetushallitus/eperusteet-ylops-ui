<template>
  <div>
    <ep-button
      icon="add"
      variant="link"
      button-class="text-decoration-none"
      no-padding
      @click="openModal()"
    >
      <span>{{ $t('lisaa-taiteenala') }}</span>
    </ep-button>
    <EpModal
      ref="taiteenalalisaysModal"
      @cancel="clear"
    >
      <template #modal-title>
        {{ $t('lisaa-taiteenala') }}
      </template>

      <ep-spinner v-if="loading" />
      <div v-else-if="kaikkiLisatty">
        {{ $t('kaikki-perusteen-taiteenalat-lisatty') }}
      </div>
      <template v-else>
        <div class="mb-3">
          {{ $t('taiteenala-lisays-ohje') }}
        </div>

        <ep-form-content :show-header="false">
          <EpToggleGroup
            v-model="valitut"
            :items="taiteenalat"
            :stacked="true"
            :is-editing="true"
          >
            <template #default="{ item }">
              {{ $kaanna(item.nimi) }}
            </template>
          </EpToggleGroup>
        </ep-form-content>
      </template>

      <template #modal-footer>
        <EpButton
          v-if="!kaikkiLisatty"
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
          @click="kaikkiLisatty ? cancel() : save()"
        >
          {{ $t(kaikkiLisatty ? 'sulje' : 'lisaa-taiteenala') }}
        </EpButton>
      </template>
    </EpModal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';

import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { Taiteenperusopetus, TpoPerusteenTaiteenalaDto } from '@shared/api/ylops';
import { $t, $kaanna, $fail } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const router = useRouter();
const taiteenalalisaysModal = useTemplateRef('taiteenalalisaysModal');

const taiteenalat = ref<TpoPerusteenTaiteenalaDto[]>([]);
const valitut = ref<TpoPerusteenTaiteenalaDto[]>([]);
const saving = ref(false);
const loading = ref(true);

const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id as number);

const kaikkiLisatty = computed(() => !loading.value && taiteenalat.value.length === 0);

const okDisabled = computed(() => !kaikkiLisatty.value && valitut.value.length === 0);

const openModal = async () => {
  taiteenalalisaysModal.value?.show();
  await load();
};

const load = async () => {
  loading.value = true;
  try {
    const [perusteTaiteenalat, opsTaiteenalat] = await Promise.all([
      Taiteenperusopetus.getPerusteTaiteenalat(opsId.value),
      Taiteenperusopetus.getTaiteenalat(opsId.value),
    ]);
    const lisatyt = new Set(_.map(opsTaiteenalat.data, 'perusteenTaiteenalaId'));
    taiteenalat.value = _.filter(perusteTaiteenalat.data, ta => !lisatyt.has(ta.id));
  }
  finally {
    loading.value = false;
  }
};

const save = async () => {
  if (kaikkiLisatty.value || _.isEmpty(valitut.value)) {
    return;
  }
  saving.value = true;
  try {
    const valitutIdt = _.map(valitut.value, ta => ta.id!);
    const opsTaiteenalat = (await Taiteenperusopetus.addTaiteenalat(opsId.value, valitutIdt)).data;
    await props.opetussuunnitelmaStore.initNavigation();
    const ensimmainen = _.find(opsTaiteenalat, ta => ta.perusteenTaiteenalaId === _.first(valitutIdt));
    if (ensimmainen) {
      await router.push({
        name: 'taiteenala',
        params: {
          ...route.params,
          taiteenalaId: '' + ensimmainen.id,
        },
      });
    }
    taiteenalalisaysModal.value?.hide();
    clear();
  }
  catch (err: any) {
    $fail($t('tallennus-epaonnistui') as string);
    if (err?.response?.data?.syy) {
      $fail(err.response.data.syy);
    }
  }
  finally {
    saving.value = false;
  }
};

const cancel = () => {
  taiteenalalisaysModal.value?.hide();
  clear();
};

const clear = () => {
  valitut.value = [];
  taiteenalat.value = [];
  loading.value = true;
};
</script>

<style scoped lang="scss">
  :deep(.ep-button) {
    .teksti {
      padding-left: 0px !important;
    }
  }
</style>
