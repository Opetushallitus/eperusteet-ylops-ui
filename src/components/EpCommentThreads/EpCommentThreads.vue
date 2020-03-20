<template>
<div>
  <slot />
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class EpCommentThreads extends Vue {
  mounted() {
    if (this.$slots.default) {
      setTimeout(() => {
        const comments = document.querySelectorAll('[comment-uuid]');
      }, 1000);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.threads {
  height: 100%;
  display: flex;

  .comment-threads {
    border-left: 1px solid #eee;
    min-width: $sidebar-width;
    max-width: $sidebar-width;
    min-height: 100vh;
    height: 100%;
  }

  .actual-content {
    width: 100%;
  }
}
</style>
