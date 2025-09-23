<template>
  <b-table responsive
           striped
           hover
           :items="items"
           :fields="fields">
    <template v-slot:cell(nimi)="data">
      {{ $kaanna(data.value) }}
    </template>
    <template v-slot:cell(muokattu)="data">
      {{ $ago(data.value) }}
    </template>
    <template v-slot:cell(esitysnimi)="data">
      {{ data.value }}
    </template>
    <template v-slot:cell(actions)="row">
      <ep-button variant="link"
                 icon="keyboard_return"
                 @click="palauta(row.item)">
        {{ $t('palauta') }}
      </ep-button>
    </template>
  </b-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { $t, $kaanna, $ago } from '@shared/utils/globals';

const props = defineProps<{
  poistetut: any[];
}>();

const emit = defineEmits(['palauta']);

const items = computed(() => {
  return props.poistetut;
});

const fields = computed(() => {
  return [{
    label: $t('nimi'),
    key: 'nimi',
    sortable: true,
    class: 'align-middle',
  }, {
    label: $t('poistoajankohta'),
    key: 'muokattu',
    sortable: true,
    class: 'align-middle',
  }, {
    label: $t('poistaja'),
    key: 'muokkaaja',
    sortable: true,
    class: 'align-middle',
  }, {
    key: 'actions',
    label: '',
    thStyle: { borderBottom: '0px' },
    class: 'align-middle',
  }];
});

const palauta = (poistettu: any) => {
  emit('palauta', poistettu);
};

</script>
