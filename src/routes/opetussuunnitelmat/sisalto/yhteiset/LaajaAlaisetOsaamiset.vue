<template>
  <div>
    <div
      v-for="(text, idx) in innerValue"
      :key="idx"
    >
      <slot :kooditettu="text">
        <h4 class="otsikko">
          {{ $kaanna(used[text.koodi].nimi) }} ({{ used[text.koodi].koodiArvo }})
        </h4>
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
      <b-dropdown
        :text="$t(nimi)"
        variant="primary"
      >
        <b-dropdown-item-button
          v-for="(koodi, idx) in used"
          :key="idx"
          :disabled="koodi.inUse"
          @click="addKooditettuKuvaus(koodi)"
        >
          {{ $kaanna(koodi.nimi) }} ({{ koodi.koodiArvo }})
        </b-dropdown-item-button>
      </b-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as _ from 'lodash';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { Lops2019ModuuliDto, Lops2019OpintojaksoDto, Lops2019OppiaineDto, Lops2019PaikallinenLaajaAlainenDto } from '@shared/api/ylops';
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
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.otsikko {
  margin-top: 1rem;
  // font-size: 1.15rem;
}

</style>
