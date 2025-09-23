<template>
  <div class="kommentti p-3">
    <div class="topbar d-flex align-items-center justify-content-between">
      <div class="pvm">{{ $ago(innerValue.luotu || new Date()) }}</div>
      <div class="actions" v-if="innerValue.tunniste">
        <b-dropdown variant="link" right no-caret>
          <template v-slot:button-content>
            <EpMaterialIcon>more_horiz</EpMaterialIcon>
          </template>
          <b-dropdown-item @click="muokkaa">
            {{ $t('muokkaa') }}
          </b-dropdown-item>
          <b-dropdown-item @click="poista">
            {{ $t('poista') }}
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
    <div class="nimi">{{ nimi }}</div>
    <div class="viesti mt-1">
      <div v-if="editable">
        <textarea
          :placeholder="$t('kirjoita-viesti')"
          class="editori"
          v-model="innerValue.sisalto"></textarea>
      </div>
      <div v-else>
        {{ innerValue.sisalto }}
      </div>
    </div>
    <div class="toiminnot" v-if="editable">
      <div class="d-flex flex-row-reverse">
        <b-button
          @click="tallenna"
          variant="primary">{{ $t('tallenna') }}</b-button>
        <b-button
          @click="peruuta"
          variant="default">{{ $t('peruuta') }}</b-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { KommenttiDto } from '@shared/api/ylops';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $bvModal } from '@shared/utils/globals';
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
