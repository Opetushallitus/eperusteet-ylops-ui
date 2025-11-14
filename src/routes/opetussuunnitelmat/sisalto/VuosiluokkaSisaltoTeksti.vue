<template>
  <div class="mt-4">
    <slot name="header">
      <h3 v-if="perusteObject">
        {{ $kaanna(perusteObject[otsikko]) }}
      </h3>
    </slot>
    <ep-collapse
      v-if="perusteObject && perusteObject[teksti]"
      tyyppi="perusteteksti"
      :border-bottom="false"
      :border-top="false"
      :expanded-by-default="perusteTekstiAvattu"
    >
      <template #header>
        <h4>{{ $t('perusteen-teksti') }}</h4>
      </template>
      <span v-html="$kaanna(perusteObject[teksti])" />
    </ep-collapse>

    <ep-collapse
      v-if="hasPohjaObject"
      class="mb-4"
      :use-padding="false"
      tyyppi="pohjateksti"
      :border-bottom="false"
      :border-top="false"
      :expanded-by-default="perusteTekstiAvattu"
    >
      <template #header>
        <h4>{{ $t('pohjan-teksti') }}</h4>
      </template>
      <span v-html="$kaanna(pohjaObject[teksti])" />
    </ep-collapse>

    <div v-if="modelValue && (hasContent || perusteObject)">
      <slot name="otsikko" />
      <h4>{{ $t('paikallinen-teksti') }}</h4>
      <ep-content
        v-if="isEditing || contentNotEmpty"
        v-model="model"
        layout="normal"
        :is-editable="isEditing"
      />
      <ep-alert
        v-if="!isEditing && !contentNotEmpty"
        :text="$t('paikallista-sisaltoa-ei-maaritetty')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = withDefaults(
  defineProps<{
    perusteObject?: any;
    pohjaObject?: any;
    modelValue?: any;
    isEditing?: boolean;
    otsikko?: string;
    teksti?: string;
    perusteTekstiAvattu?: boolean;
  }>(), {
    isEditing: false,
    otsikko: 'otsikko',
    teksti: 'teksti',
    perusteTekstiAvattu: false,
  });

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue[props.teksti],
  set: (value) => {
    emit('update:modelValue', {
      ...props.modelValue,
      [props.teksti]: value,
    });
  },
});

const hasContent = computed(() => {
  return props.modelValue != null && _.has(props.modelValue, props.teksti);
});

const contentNotEmpty = computed(() => {
  return props.modelValue != null && props.modelValue[props.teksti] != null;
});

const hasPohjaObject = computed(() => {
  return props.pohjaObject && props.pohjaObject[props.teksti] && Object.keys(props.pohjaObject[props.teksti]).length > 0;
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

</style>
