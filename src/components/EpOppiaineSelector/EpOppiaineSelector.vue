<template>
<div v-if="isEditable">

  <ep-multi-list-select
    v-if="cache"
    :modelValue="sortedValue"
    tyyppi="oppiaine"
    :items="selectOptions"
    @update:modelValue="handleInput"
    :validation="validation"
    :required="true"
    :help="help"
    :multiple="multiple"/>

</div>
<div v-else-if="modelValue">
  <div v-if="isArray">
    <ul>
      <li v-for="uri in modelValue" :key="uri">
        <span>{{ $kaanna(oppiaineetMap[uri].nimi) }}</span>
        <span class="ml-1">({{ oppiaineetMap[uri].koodiArvo }})</span>
      </li>
    </ul>
  </div>
  <div v-else-if="oppiaineetMap[modelValue]">
    <span>{{ $kaanna(oppiaineetMap[modelValue].nimi) }}</span>
    <span class="ml-1">({{ oppiaineetMap[modelValue].koodiArvo }})</span>
  </div>
</div>
<!--
<div v-else>
  <p>{{ $t('oppiainetta-ei-valittu') }}</p>
</div>
-->
</template>

<script setup lang="ts">
import { computed, ref, onMounted, inject } from 'vue';
import _ from 'lodash';
import EpMultiListSelect from '@shared/components/forms/EpMultiListSelect.vue';
import { PerusteCache } from '@/stores/peruste';
import { Kielet } from '@shared/stores/kieli';
import { getArvo, getUri, paikallisestiSallitutLaajennokset, koodiNumero, koodiAlku } from '@/utils/perusteet';
import { useEpOpsComponent } from '@/mixins/EpOpsComponent';
import { $kaanna } from '@shared/utils/globals';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

const props = defineProps<{
  modelValue: string | string[];
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
  isEditable?: boolean;
  multiple?: boolean;
  oppiaineFilter: (any: any) => boolean;
  allowOppiaine?: boolean;
  help?: string;
  validation?: any;
}>();

const emit = defineEmits(['update:modelValue']);


// Use the composable
const { store, opsId } = useEpOpsComponent(props.opetussuunnitelmaStore);

const cache = ref<PerusteCache | null>(null);

const isArray = computed(() => {
  return _.isArray(props.modelValue);
});

const sortedValue = computed(() => {
  if (_.isArray(props.modelValue)) {
    return _.sortBy(props.modelValue || [], _.identity);
  }
  else if (_.isString(props.modelValue)) {
    return props.modelValue;
  }
  else {
    return null;
  }
});

const paikallisetOppiaineet = computed(() => {
  return _(store.value.paikallisetOppiaineet)
    .filter(getUri)
    .map((oa) => {
      return {
        ...oa,
        koodi: {
          uri: oa.koodi,
        },
      };
    })
    .value();
});

const oppiaineet = computed(() => {
  if (cache.value) {
    return [
      ...cache.value.peruste.oppiaineet,
      ...paikallisetOppiaineet.value,
    ];
  }
  else {
    return [];
  }
});

const oppiaineetJaOppimaarat = computed(() => {
  return _(oppiaineet.value)
    .map((oa: any) => {
      if (_.isEmpty(oa.oppimaarat)) {
        return [oa];
      }
      else {
        return [
          oa,
          ..._.map(oa.oppimaarat, om => ({
            ...om,
            child: true,
          })),
        ];
      }
    })
    .flatten()
    .map(oa => ({
      ...oa,
      koodiUri: getUri(oa),
      koodiArvo: getArvo(oa),
    }))
    .filter(oppiaine => props.oppiaineFilter(oppiaine))
    .sortBy((oa: any) => !_.isString(oa.koodi), koodiAlku, koodiNumero)
    .value();
});

const oppiaineetMap = computed(() => {
  return _.keyBy(oppiaineetJaOppimaarat.value, getUri);
});

const selectOptions = computed(() => {
  return _.chain(oppiaineetJaOppimaarat.value)
    .map((oppiaine: any) => {
      return {
        value: oppiaine.koodiUri,
        text: `${$kaanna(oppiaine.nimi)} (${oppiaine.koodiArvo})`,
        unselectable: !_.isEmpty(oppiaine.oppimaarat) && !props.allowOppiaine,
        child: oppiaine.child,
      };
    })
    .value();
});

const handleInput = (value: any) => {
  emit('update:modelValue', value);
};

onMounted(async () => {
  cache.value = await PerusteCache.of(opsId.value);
});
</script>

<style scoped lang="scss">
.selected {
  //font-size: 1rem;

  .btn-remove {
    padding: 0 0.5rem 0 0.5rem;
  }
}
</style>
