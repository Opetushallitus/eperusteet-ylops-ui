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
  private toggled = true;

  public mounted() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  public destroyed() {
    window.removeEventListener('resize', this.onResize);
  }

  private onResize() {
    this.toggled = window.innerWidth > 991;
  }
}
</script>
<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.sidenav {
  @media (min-width: 1443.98px) {
    .menubutton {
      display:none;
    }
  }

  @media only screen and (min-width: 991px) {
    display: flex;

    .bar {
      min-width: $sidebar-width;
      max-width: $sidebar-width;
      min-height: 100vh;
    }

    .view {
      border-left: 1px solid #E0E0E1;
      width: 100%;
    }
  }

}
</style>
