<template>
  <div>
    <div class="content">
      <div class="container">
        <div class="w-full min-w-0">
          <slot name="header" />
        </div>
        <div
          v-if="hasDefaultSlot"
          class="view-content"
        >
          <div class="w-full min-w-0">
            <slot name="default" />
          </div>
        </div>
        <slot name="custom-content" />
      </div>
    </div>
    <slot name="after" />
  </div>
</template>

<script setup lang="ts">
import { hasSlotContent } from '@shared/utils/vue-utils';
import { computed } from 'vue';
import { useSlots } from 'vue';

const slots = useSlots();

const hasDefaultSlot = computed(() => {
  return hasSlotContent(slots.default);
});
</script>

<style scoped lang="scss">

@import "@shared/styles/_variables.scss";

.content {
  padding: 20px;
}

.col-fixed {
  flex: 0 0 $main-view-offset;
}

h5 {
  overflow-x: hidden;
}

.view-content {
  margin-top: 40px;
}

</style>
