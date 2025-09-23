<template>
  <div>
    <ep-search v-model="query" class="mb-4" />
    <poistetut-table :poistetut="rajatut" @palauta="palauta" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import _ from 'lodash';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import PoistetutTable from './PoistetutTable.vue';
import { Lops2019PoistettuDto } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';

const props = defineProps<{
  poistetut: Lops2019PoistettuDto[];
}>();

const emit = defineEmits(['palauta']);

const query = ref('');

const rajatut = computed(() => {
  const hakutermi = _.toLower(query.value);
  const kieli = Kielet.getSisaltoKieli.value;

  return _.chain(props.poistetut)
    .filter(p => _.includes(_.toLower(_.get(p, 'nimi.' + kieli)), hakutermi))
    .sortBy('muokattu')
    .reverse()
    .value();
});

const palauta = (poistettu: any) => {
  emit('palauta', poistettu);
};

</script>
