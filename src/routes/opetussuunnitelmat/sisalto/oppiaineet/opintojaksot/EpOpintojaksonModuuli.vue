<template>
<div class="moduulibox" role="button" :class="{'moduulibox-valittu': valittu, 'selectable': isEditing}" @click="toggle()" @keyup.enter="toggle()" tabindex="0" :title="moduuliNimi">
  <div class="name">{{ $kaanna(moduuli.nimi) }} ({{ moduuli.koodi.arvo }})</div>
  <div class="bottom">
    <div class="d-flex bd-highlight justify-content-end">
      <div class="px-2 info">
        <span class="op">{{ moduuli.laajuus }} {{ $t('opintopiste') }}</span>
        <ep-color-indicator :kind="moduuli.pakollinen ? 'pakollinen' : 'valinnainen'">
        </ep-color-indicator>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import _ from 'lodash';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import { Lops2019OpintojaksonModuuliDto, Lops2019ModuuliDto, Lops2019OpintojaksoDto } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';
import { $t, $kaanna } from '@shared/utils/globals';

const props = withDefaults(
  defineProps<{
    moduuli: Lops2019ModuuliDto;
    modelValue?: Lops2019OpintojaksonModuuliDto[];
    isEditing?: boolean;
  }>(), {
  isEditing: false,
});

const emit = defineEmits(['update:modelValue']);

const moduuliNimi = computed(() => {
  return Kielet.kaanna((props.moduuli as any).nimi);
});

const koodi = computed(() => {
  try {
    return props.moduuli!.koodi!.uri!;
  }
  catch (err) {
    return null;
  }
});

const koodit = computed(() => {
  return _.keyBy(props.modelValue || [], 'koodiUri');
});

const valittu = computed(() => {
  return koodi.value && koodit.value[koodi.value];
});

const toggle = () => {
  if (!props.isEditing) {
    return;
  }

  const koodiUri = koodi.value;
  if (koodiUri) {
    if (koodit.value[koodiUri]) {
      emit('update:modelValue', _.reject(props.modelValue || [], x => x.koodiUri === koodiUri));
    }
    else {
      emit('update:modelValue', [
        ...(props.modelValue || []),
        { koodiUri },
      ]);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.moduulibox {
  background-color: #E6F6FF;
  height: 161px;
  margin: 0;
  padding: 20px 10px 44px 20px;
  position: relative;
  width: 158px;
  color: $blue-darken-1;
  user-select: none;
  border-radius: 10px;
  box-shadow: 2px 3px 4px 1px rgba(0,26,88,0.1);
  outline: none;

  &.selectable {
    cursor: pointer;
  }

  &:hover {
    background-color: #C3EAFF;
  }

  .name {
    text-overflow: ellipsis;
    overflow: hidden;
    font-weight: bold;
    height: 100px;

    &::-webkit-scrollbar {
      width: 0.5em;
    }
    &::-webkit-scrollbar-track {
      background-color: $blue-lighten-4;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $blue-lighten-3;
      border-radius: 0.5em;
    }
  }

  .bottom {
    width: 100%;
    padding: 10px;
    position: absolute;
    left: 0;
    bottom: 0;

    .icon {
      display: inline-block;
      outline: none;
      color: #3367E3;
    }

    .icon-editing {
      cursor: pointer;
    }

    .info {
      .op {
        padding: 0 5px 0 0;
      }
    }
  }
}

.moduulibox-valittu {
  color: white;
  animation: fade 0.1s linear;
  background-color: #3367E3;

   &:hover {
    background-color: #3367E3;
  }

  .name {
    &::-webkit-scrollbar-track {
      background-color: $light-blue;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $dark-blue;
    }
  }

  .bottom {
    .icon {
      color: white;
    }
  }
}

</style>
