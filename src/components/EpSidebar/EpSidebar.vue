<template>
<div>
  <div class="sidenav d-flex">
    <div class="closed">
      <button class="btn btn-link" @click="toggled = !toggled" v-if="!toggled">
        <span class="bar"><fas icon="bars"></fas></span>
      </button>
    </div>
    <div class="bar d-flex flex-column" v-if="toggled">
      <div class="d-flex flex-row">
        <button class="btn btn-link menubutton" @click="toggled = !toggled" v-if="toggled"><fas icon="bars"></fas></button>
      </div>
      <slot name="bar" class="flex-fill"></slot>
    </div>
    <div class="view">
      <slot name="view"></slot>
    </div>
  </div>
</div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class EpSidebar extends Vue {
  private width = window.innerWidth;
  private toggled = true;

  public mounted() {
    window.addEventListener('resize', this.onResize);
  }

  public destroyed() {
    window.removeEventListener('resize', this.onResize);
  }

  private onResize(data: Event) {
    const newWidth = window.innerWidth;
    if (this.width >= 768 && newWidth < 768) {
      this.toggled = false;
    }
    if (this.width < 768 && newWidth >= 768) {
      this.toggled = true;
    }

    this.width = newWidth;
  }
}
</script>
<style scoped lang="scss">
@import "@/styles/_variables.scss";

.sidenav {
  @media (min-width: 1443.98px) {
    .menubutton {
      display:none;
    }
  }

  @media only screen and (min-width: 768px) {
    display: flex;

    .bar {
      min-width: $sidebar-width;
      max-width: $sidebar-width;
      min-height: 100vh;
    }

    .view {
      border-left: 1px solid #eee;
      width: 100%;
      margin-bottom: 200px;
    }
  }

}
</style>
