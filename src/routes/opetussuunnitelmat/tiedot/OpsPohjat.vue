<template>
  <div>
    <div v-if="perityvatPohjatCount > 0">
      <div v-for="(pohja, idx) in ops.periytyvatPohjat" :key="'per' + (idx + 1)" class="d-flex">
        <EpMaterialIcon v-if="idx > 0"
                        size="22px"
                        :color="'#555'"
                        :style="{ marginLeft: ((idx - 1) * 25) + 'px' }">
          subdirectory_arrow_right
        </EpMaterialIcon>
        <router-link v-if="pohja.id"
                     :to="{ name:'opsTiedot', params: { id: pohja.id } }"
                     target="_blank"
                     rel="noopener noreferrer">
          <span>{{ $kaanna(pohja.nimi) }}</span>
        </router-link>
        <span v-else>{{ $kaanna(pohja.nimi) }}</span>
      </div>
    </div>
    <div>
      <EpMaterialIcon v-if="perityvatPohjatCount > 0"
                      class="mr-1"
                      size="22px"
                      :color="'#555'"
                      :style="{ marginLeft: ((perityvatPohjatCount - 1) * 25) + 'px' }">
        subdirectory_arrow_right
      </EpMaterialIcon>
      <span class="current-ops">{{ $kaanna(ops.nimi) }}</span>
    </div>
    <div v-if="ops.joissaPohjana && ops.joissaPohjana.length > 0" class="d-flex">
      <EpMaterialIcon class="mr-1"
                      size="22px"
                      :color="'#555'"
                      :style="{ marginLeft: (perityvatPohjatCount * 25) + 'px' }">
        subdirectory_arrow_right
      </EpMaterialIcon>
      <EpNaytaKaikki v-model="ops.joissaPohjana">
        <template #default="{ data }">
          <router-link v-if="data.id"
                       :to="{ name:'opsTiedot', params: { id: data.id } }"
                       target="_blank"
                       rel="noopener noreferrer">
            <span>{{ $kaanna(data.nimi) }}</span>
          </router-link>
          <span v-else>{{ $kaanna(data.nimi) }}</span>
        </template>
      </EpNaytaKaikki>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpNaytaKaikki from '@shared/components/EpNaytaKaikki/EpNaytaKaikki.vue';
import { $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  ops: any;
}>();

const perityvatPohjatCount = computed(() => {
  return props.ops.periytyvatPohjat?.length || 0;
});
</script>

<style scoped lang="scss">

.current-ops {
  font-weight: 600;
}

:deep(.row) {
  padding: 0 15px;
}
</style>
