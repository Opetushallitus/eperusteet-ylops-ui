<template>
  <div>
    <div
      v-for="(opintojakso, index) in opintojaksot"
      :key="index"
    >
      <div
        class="oj-content"
        :class="{'selected': opintojakso.selected || !isEditing, 'selectable': isEditing}"
        @click="select(opintojakso)"
      >
        <span class="nimi">
          <span class="mr-2">{{ $kaanna(opintojakso.nimi) }}</span>
          <span v-if="opintojakso.koodi">({{ opintojakso.koodi }})</span>
        </span>
        <span class="pituus">{{ opintojakso.laajuus }} {{ $t('opintopiste') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import { Lops2019OpintojaksoDto } from '@shared/api/ylops';
import { $t, $kaanna } from '@shared/utils/globals';

const props = withDefaults(
  defineProps<{
    options?: Lops2019OpintojaksoDto[];
    modelValue: Lops2019OpintojaksoDto[];
    isEditing?: boolean;
  }>(), {
    isEditing: false,
  });

const emit = defineEmits(['update:modelValue']);

const opintojaksot = computed(() => {
  if (!props.isEditing) {
    return props.modelValue;
  }

  return _.map(props.options, (option) => {
    return {
      ...option,
      selected: _.includes(_.map(props.modelValue, 'koodi'), option.koodi),
    };
  });
});

const select = (opintojakso: Lops2019OpintojaksoDto) => {
  if (!props.isEditing) {
    return;
  }

  if (_.includes(_.map(props.modelValue, 'koodi'), opintojakso.koodi)) {
    emit('update:modelValue', _.filter(props.modelValue, (oj) => oj.koodi !== opintojakso.koodi));
  }
  else {
    emit('update:modelValue', [
      ...props.modelValue,
      opintojakso,
    ]);
  }
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

  .oj-content {
    border-radius: 24px;
    border: 1px solid #CDEEFF;
    padding: 14px 30px;
    display: flex;
    margin-top: 5px;
    margin-bottom: 5px;
    background-color: #E6F6FF;

    &.selectable{
      cursor:pointer;
    }

    span.nimi {
      flex: 1 0 auto;
    }

    span.pituus {
      min-width: 4em;
    }

    span.tyyppi {
      min-width: 6em;
    }

    &.selected {
      background-color: #3367E3;
      color: $white;
    }

    &:hover:not(.selected.selectable) {
      background-color: #C3EAFF;
    }
  }

</style>
