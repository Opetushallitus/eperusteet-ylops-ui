<template>
  <div>
    <div
      v-for="(text, idx) in innerValue"
      :key="idx"
      class="mb-3"
    >
      <slot :kooditettu="text">
        <div class="flex items-center justify-between mb-1">
          <h4 class="otsikko !m-0">
            {{ $kaanna(used[text.koodi].nimi) }} ({{ used[text.koodi].koodiArvo }})
          </h4>
          <EpButton
            v-if="isEditable"
            variant="link"
            @click="poistaKooditettuKuvaus(text)"
          >
            {{ $t('poista') }}
          </EpButton>
        </div>
        <ep-content
          :model-value="text.kuvaus"
          :is-editable="isEditable"
          layout="normal"
          @update:model-value="updatedKuvaus(text.koodi, $event)"
        />
      </slot>
    </div>

    <div
      v-if="isEditable"
      class="mt-4"
    >
      <EpDropdown>
        <template #button-content>
          <EpButton variant="primary">
            {{ $t(nimi) }}
          </EpButton>
        </template>
        <EpDropdownItem
          v-for="(koodi, idx) in used"
          :key="idx"
          :disabled="koodi.inUse"
          @click="addKooditettuKuvaus(koodi)"
        >
          {{ $kaanna(koodi.nimi) }} ({{ koodi.koodiArvo }})
        </EpDropdownItem>
      </EpDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as _ from 'lodash';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpDropdown from '@shared/components/EpDropdown/EpDropdown.vue';
import EpDropdownItem from '@shared/components/EpDropdown/EpDropdownItem.vue';
import { LokalisoituTekstiDto } from '@shared/tyypit';
import { $t, $kaanna } from '@shared/utils/globals';

interface Koodi {
  koodiUri: string;
  koodiArvo: string;
  nimi: any;
}

export interface KoodiKuvaus {
  koodi: string;
  kuvaus: LokalisoituTekstiDto;
}

const props = withDefaults(
  defineProps<{
    modelValue: KoodiKuvaus[] | null;
    koodit: Koodi[] | null;
    isEditable?: boolean;
    nimi: string;
  }>(), {
    isEditable: false,
  });

const emit = defineEmits(['update:modelValue']);

const innerValue = computed(() => {
  if (props.modelValue) {
    return props.modelValue;
  }
  else {
    return [];
  }
});

const used = computed(() => {
  return _.chain(props.koodit)
    .map(v => ({
      ...v,
      inUse: _.includes(_.map(innerValue.value, 'koodi'), v.koodiUri),
    }))
    .keyBy('koodiUri')
    .value();
});

const updateValue = (value: KoodiKuvaus[]) => {
  console.log('updateValue', value);
  emit('update:modelValue', _.sortBy(value, 'koodi'));
};

const updatedKuvaus = (koodi: string, value: LokalisoituTekstiDto) => {
  const nval = [...innerValue.value];
  const idx = _.findIndex(innerValue.value, { koodi });
  if (idx > -1) {
    nval[idx].kuvaus = value;
    updateValue(nval);
  }
};

const addKooditettuKuvaus = (koodi: Koodi) => {
  updateValue([...innerValue.value, {
    koodi: koodi.koodiUri,
    kuvaus: {},
  }]);
};

const poistaKooditettuKuvaus = (item: KoodiKuvaus) => {
  updateValue(innerValue.value.filter(k => k.koodi !== item.koodi));
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.otsikko {
  margin-top: 1rem;
  // font-size: 1.15rem;
}

</style>
