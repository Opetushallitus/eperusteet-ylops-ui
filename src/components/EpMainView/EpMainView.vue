<template lang="pug">
div
  ep-navigation
  .content
    .container-fluid
      .row
        .col.col-fixed
          slot(name="icon")
        .col
          slot(name="header")
      .view-content(v-if="$slots['default']")
        .row
          .col.col-fixed.col-new
          .col
            slot(name="default")
      slot(name="custom-content")
  slot(name="after")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
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
.col-fixed {
  flex: 0 0 100px;
}

h5 {
  overflow-x: hidden;
}

.view-content {
  margin-top: 40px;
}
</style>
