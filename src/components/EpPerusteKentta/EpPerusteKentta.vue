<template>
  <div
    v-if="naytettava"
    class="mt-4"
  >
    <h3>{{ otsikkoTeksti }}</h3>
    <div v-html="$kaanna(sisalto)" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  tekstiOsa?: any;
  teksti?: any;
  otsikkoKey?: string;
}>();

const sisalto = computed(() => props.tekstiOsa?.teksti ?? props.teksti);

const naytettava = computed(() => !!sisalto.value);

const otsikkoTeksti = computed(() => {
  if (props.tekstiOsa?.otsikko) {
    return $kaanna(props.tekstiOsa.otsikko);
  }
  return props.otsikkoKey ? $t(props.otsikkoKey) : '';
});
</script>
