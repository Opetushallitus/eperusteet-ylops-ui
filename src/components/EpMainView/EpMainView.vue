<template>
<div>
  <ep-navigation></ep-navigation>
  <div class="content">
    <div class="container">
      <div class="row">
        <div class="col">
          <slot name="header"></slot>
        </div>
      </div>
      <div class="view-content" v-if="hasDefaultSlot">
        <div class="row">
          <div class="col">
            <slot name="default"></slot>
          </div>
        </div>
      </div>
      <slot name="custom-content"></slot>
    </div>
  </div>
  <slot name="after"></slot>
</div>
</template>

<script setup lang="ts">
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
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
