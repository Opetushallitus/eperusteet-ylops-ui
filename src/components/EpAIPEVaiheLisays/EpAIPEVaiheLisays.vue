<template>
  <div>
    <ep-button
      icon="add"
      variant="link"
      button-class="text-decoration-none"
      no-padding
      @click="openModal()"
    >
      <span>{{ $t('lisaa-vaihe') }}</span>
    </ep-button>
    <b-modal
      id="aipevaihelisays"
      ref="vaihelisaysModal"
      size="lg"
      centered
      :ok-disabled="okDisabled"
      :ok-only="kaikkiLisatty"
      static
      lazy
      @hidden="clear"
      @show="show"
      @ok="save"
    >
      <template #modal-title>
        {{ $t('lisaa-vaihe') }}
      </template>

      <ep-spinner v-if="loading" />
      <div v-else-if="kaikkiLisatty">
        {{ $t('vaihe-lisays-kaikki-lisatty') }}
      </div>
      <template v-else>
        <div>{{ $t('vaihe-lisays-modal-selite') }}</div>

        <ep-form-content
          :show-header="false"
          class="mt-4"
        >
          <h3>{{ $t('valitse-vaihe') }}</h3>
          <ep-select
            v-model="valittuVaihe"
            class="mb-5"
            :items="vaiheet"
            :is-editing="true"
            :enable-empty-option="true"
          >
            <template #default="{ item }">
              {{ $kaanna(item.nimi) }}
            </template>
          </ep-select>
        </ep-form-content>
      </template>

      <template #modal-cancel>
        {{ $t('peruuta') }}
      </template>
      <template #modal-ok>
        <EpSpinner
          v-if="saving"
          small
          color="white"
        />
        <span v-else>{{ $t(kaikkiLisatty ? 'sulje' : 'lisaa-vaihe') }}</span>
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

import { $t, $kaanna, $fail } from '@shared/utils/globals';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { AIPE, AIPEPerusteVaiheKevytDto } from '@shared/api/ylops';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const router = useRouter();
const vaihelisaysModal = useTemplateRef('vaihelisaysModal');

const vaiheet = ref<AIPEPerusteVaiheKevytDto[]>([]);
const valittuVaihe = ref<AIPEPerusteVaiheKevytDto | null>(null);
const saving = ref(false);
const loading = ref(true);

const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);

const kaikkiLisatty = computed(() => !loading.value && vaiheet.value.length === 0);

const okDisabled = computed(() => !kaikkiLisatty.value && !valittuVaihe.value);

const openModal = () => {
  vaihelisaysModal.value?.show();
};

const show = async () => {
  loading.value = true;
  try {
    const [perusteVaiheet, opsVaiheet] = await Promise.all([
      AIPE.getPerusteVaiheet(opsId.value as number),
      AIPE.getVaiheet(opsId.value as number),
    ]);
    const lisatyt = new Set((opsVaiheet.data || []).map(v => v.perusteenVaiheId));
    vaiheet.value = (perusteVaiheet.data || []).filter(v => !lisatyt.has(v.id));
  }
  finally {
    loading.value = false;
  }
};

const save = async (event: Event) => {
  if (kaikkiLisatty.value) {
    return;
  }
  event.preventDefault();
  saving.value = true;
  try {
    const uusi = (await AIPE.addVaihe(opsId.value as number, valittuVaihe.value.id!)).data;
    await props.opetussuunnitelmaStore.initNavigation();
    await router.push({
      name: 'aipevaihe',
      params: {
        ...route.params,
        vaiheId: '' + uusi.id,
      },
    });
    vaihelisaysModal.value?.hide();
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

const clear = () => {
  valittuVaihe.value = null;
  vaiheet.value = [];
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
