<template>
  <div>
    <ep-button
      icon="keyboard_return"
      variant="link"
      :show-spinner="palautuksessa"
      @click="showModal"
    >
      {{ $t('palauta') }}
    </ep-button>

    <b-modal
      ref="opsPalautusModal"
      size="lg"
      class="palautus-modal"
    >
      <template #modal-header>
        <h5 class="modal-title">
          {{ $t(tyyppitekstit.palautaOps) }}
        </h5>
      </template>

      <div
        class="content"
        v-html="$t(tyyppitekstit.palautaOpsKuvaus)"
      />

      <template #modal-footer>
        <div class="d-flex">
          <ep-button
            variant="link"
            @click="peruuta"
          >
            {{ $t('peruuta') }}
          </ep-button>
          <ep-button
            variant="primary"
            @click="palauta('luonnos')"
          >
            {{ $t('palauta-luonnokseksi') }}
          </ep-button>
          <ep-button
            v-if="isJulkaistu"
            variant="primary"
            class="ml-3"
            @click="palauta('julkaistu')"
          >
            {{ $t('palauta-julkaistuksi') }}
          </ep-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { $t } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelma?: any;
}>();

const emit = defineEmits<{
  palauta: [opetussuunnitelma: any, tila: 'luonnos' | 'julkaistu', callback: () => void];
}>();

// Template refs
const opsPalautusModal = useTemplateRef('opsPalautusModal');

// Reactive data
const palautuksessa = ref(false);

// Computed properties
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

// Methods
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
