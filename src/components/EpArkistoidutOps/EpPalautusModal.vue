<template>
  <div>
    <EpButton
      icon="keyboard_return"
      variant="link"
      :show-spinner="palautuksessa"
      @click="showModal"
    >
      {{ $t('palauta') }}
    </EpButton>

    <EpModal
      ref="opsPalautusModal"
      size="lg"
      class="palautus-modal"
    >
      <template #modal-title>
        <h5 class="modal-title m-0 font-semibold">
          {{ $t(tyyppitekstit.palautaOps) }}
        </h5>
      </template>

      <div
        class="content"
        v-html="$t(tyyppitekstit.palautaOpsKuvaus)"
      />

      <template #modal-footer>
        <div class="flex flex-wrap gap-2 justify-end">
          <EpButton
            variant="link"
            @click="peruuta"
          >
            {{ $t('peruuta') }}
          </EpButton>
          <EpButton
            variant="primary"
            @click="palauta('luonnos')"
          >
            {{ $t('palauta-luonnokseksi') }}
          </EpButton>
          <EpButton
            v-if="isJulkaistu"
            variant="primary"
            @click="palauta('julkaistu')"
          >
            {{ $t('palauta-julkaistuksi') }}
          </EpButton>
        </div>
      </template>
    </EpModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';

import { $t } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelma?: any;
}>();

const emit = defineEmits<{
  palauta: [opetussuunnitelma: any, tila: 'luonnos' | 'julkaistu', callback: () => void];
}>();

const opsPalautusModal = useTemplateRef('opsPalautusModal');

const palautuksessa = ref(false);

const isJulkaistu = computed(() => {
  return !!props.opetussuunnitelma?.viimeisinJulkaisuAika;
});

const tyyppitekstit = computed(() => {
  if (!props.opetussuunnitelma) {
    return {};
  }

  const tekstit = {
    'pohja': {
      palautaOps: 'palauta-pohja',
      palautaOpsKuvaus: 'palauta-pohja-kuvaus',
    },
    'ops': {
      palautaOps: 'palauta-ops',
      palautaOpsKuvaus: isJulkaistu.value ? 'palauta-julkaistu-ops-kuvaus' : 'palauta-ops-kuvaus',
    },
  };

  return tekstit[props.opetussuunnitelma.tyyppi];
});

const showModal = () => {
  opsPalautusModal.value?.show();
};

const peruuta = async () => {
  opsPalautusModal.value?.hide();
};

const palauta = async (tila: 'luonnos' | 'julkaistu') => {
  palautuksessa.value = true;
  opsPalautusModal.value?.hide();
  await emit('palauta', props.opetussuunnitelma, tila, () => {
    palautuksessa.value = false;
  });
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.content {
  height: 200px;
}

</style>
