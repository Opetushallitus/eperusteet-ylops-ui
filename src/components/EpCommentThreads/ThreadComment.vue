<template>
  <div class="kommentti p-3">
    <div class="topbar flex items-center justify-between">
      <div class="pvm">
        {{ $ago(innerValue.luotu || new Date()) }}
      </div>
      <div
        v-if="innerValue.tunniste"
        class="actions"
      >
        <EpDropdown
          :right="true"
          :no-caret="true"
        >
          <template #button-content>
            <EpMaterialIcon>more_horiz</EpMaterialIcon>
          </template>
          <EpDropdownItem @click="muokkaa">
            {{ $t('muokkaa') }}
          </EpDropdownItem>
          <EpDropdownItem @click="poista">
            {{ $t('poista') }}
          </EpDropdownItem>
        </EpDropdown>
      </div>
    </div>
    <div class="nimi">
      {{ nimi }}
    </div>
    <div class="viesti mt-1">
      <div v-if="editable">
        <textarea
          v-model="innerValue.sisalto"
          :placeholder="$t('kirjoita-viesti')"
          class="editori"
        />
      </div>
      <div v-else>
        {{ innerValue.sisalto }}
      </div>
    </div>
    <div
      v-if="editable"
      class="toiminnot"
    >
      <div class="flex flex-row-reverse gap-2">
        <EpButton
          variant="primary"
          @click="tallenna"
        >
          {{ $t('tallenna') }}
        </EpButton>
        <EpButton
          variant="secondary"
          @click="peruuta"
        >
          {{ $t('peruuta') }}
        </EpButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { KommenttiDto } from '@shared/api/ylops';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpDropdown from '@shared/components/EpDropdown/EpDropdown.vue';
import EpDropdownItem from '@shared/components/EpDropdown/EpDropdownItem.vue';
import { $t } from '@shared/utils/globals';
import _ from 'lodash';

const props = defineProps<{
  value: KommenttiDto;
  save: (uusi: KommenttiDto) => Promise<KommenttiDto>;
  remove: (uusi: KommenttiDto) => Promise<KommenttiDto>;
}>();

const isEditing = ref(false);
const innerValue = ref<KommenttiDto | null>(null);

const updateValue = (val?: KommenttiDto) => {
  innerValue.value = { ...props.value };
};

watch(() => props.value, updateValue, { immediate: true });

const nimi = computed(() => {
  return innerValue.value?.nimi || innerValue.value?.muokkaaja || $t('tuntematon-kayttaja');
});

const editable = computed(() => {
  return isEditing.value || !props.value.tunniste;
});

const isNew = computed(() => {
  return !!props.value.luoja;
});

const poista = async () => {
  await props.remove(props.value);
};

const muokkaa = async () => {
  isEditing.value = true;
};

const peruuta = async () => {
  isEditing.value = false;
  if (!props.value.tunniste) {
    await poista();
  }
  else {
    updateValue(props.value);
  }
};

const tallenna = async () => {
  if (!innerValue.value) {
    return;
  }
  await props.save({
    ...props.value,
    sisalto: innerValue.value.sisalto,
  });
  isEditing.value = false;
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.kommentti {
  background: #fff;
  height: 100%;
  box-shadow: 0 2px 4px 0 rgba(207, 207, 207, 0.5);
  border: 1px solid #eee;

  .topbar {
    height: 10px;

    .pvm {
      color: #555;
    }

    .actions {
      color: #28344F;
    }
  }

  .nimi {
    color: #28344F;
    font-weight: 600;
    font-size: 1.2em;
  }

  .viesti {
    color: #575757;

    textarea.editori {
      border: 1px solid #ccc;
      min-height: 4em;
      overflow: auto;
      resize: vertical;
      width: 100%;
    }
  }
}

.subthreads {
  margin-left: 20px;
}

</style>
