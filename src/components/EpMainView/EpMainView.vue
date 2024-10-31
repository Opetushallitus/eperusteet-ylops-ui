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
      <div class="view-content" v-if="$slots['default']">
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

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';

@Component({
  components: {
    EpNavigation,
  },
})
export default class EpMainView extends Vue {
}
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
