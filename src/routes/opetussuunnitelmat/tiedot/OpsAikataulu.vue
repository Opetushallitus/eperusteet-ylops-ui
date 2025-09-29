<template>
  <div class="content">
    <div class="row">
      <div class="col">
        <h2>{{ $t('aikataulu') }}</h2>
      </div>
      <div class="col text-right">
        <ep-aikataulu-modal
          ref="aikataulumodal"
          v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'opetussuunnitelma' }"
          :root-model="ops"
          :aikataulut="aikataulut"
          @tallenna="tallenna"
        >
          <template #selite>
            <p>{{ $t('aikataulu-modal-selite') }}</p>
          </template>
        </ep-aikataulu-modal>
      </div>
    </div>

    <ep-spinner v-if="!aikataulut" />

    <div v-else>
      <div
        v-if="aikataulut.length === 0"
        class="text-center"
      >
        <ep-button
          button-class="pl-5 pr-5"
          @click="otaAikatauluKayttoon"
        >
          <span>{{ $t('ota-kayttoon') }}</span>
        </ep-button>
      </div>

      <div v-else>
        <ep-aikataulu :aikataulut="aikataulut" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue';
import * as _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpAikatauluModal from '@shared/components/EpAikataulu/EpAikatauluModal.vue';
import { OpetussuunnitelmaKevytDto } from '@shared/api/ylops';
import { AikatauluStore } from '@/stores/aikataulu';
import { success } from '@/utils/notifications';
import { $success, $t } from '@shared/utils/globals';

const props = defineProps<{
  ops: OpetussuunnitelmaKevytDto;
  aikatauluStore: AikatauluStore;
}>();

const aikataulumodal = useTemplateRef('aikataulumodal');

const aikataulut = computed(() => {
  return props.aikatauluStore.aikataulut.value;
});

const otaAikatauluKayttoon = () => {
  const modalRef = aikataulumodal.value;
  if (modalRef) {
    (modalRef as any).openModal();
  }
};

const tallenna = async (aikataulutData: any) => {
  const processedAikataulut = _.map(aikataulutData, aikataulu => {
    return {
      ...aikataulu,
      opetussuunnitelmaId: props.ops.id,
    };
  });

  await props.aikatauluStore.saveAikataulut(processedAikataulut);
  $success('aikataulu-tallennettu');
};

onMounted(async () => {
  await props.aikatauluStore.update();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .pohja {
    margin: 10px 0px;
    background-color: $gray-lighten-8;
    border-radius: 15px;
    height: 15px;
    position: relative;

    .kulunut-aika {
      background-color: $green-lighten-3;
      border-radius: 15px;
      height: 15px;
      position: absolute;
    }

    .aikataulu {
      height: 15px;
      width: 15px;
      border-radius: 30px;
      position: absolute;

      &.tavoite {
        background-color: $blue;
      }

      &.julkaisu {
        background-color: $blue-lighten-2;
      }
    }

  }

  .alainfo {
    position: relative;

    .julkaisu {
      position: absolute;
    }
  }

  .luomispaiva {
    border-left: 1px solid $gray-lighten-3;
    padding-left: 5px;
  }

  .julkaisupaiva {
    border-right: 1px solid $gray-lighten-3;
    padding-right: 5px;
  }

  .paiva-alatieto {
    color: $gray-lighten-1;
  }

</style>
