<template>
<div>
  <div class="sidenav d-flex">
    <div class="closed">
      <button class="btn btn-link menubutton" @click="toggled = !toggled" v-if="!toggled">
        <span class="bar">
          <EpMaterialIcon>menu</EpMaterialIcon>
        </span>
      </button>
    </div>
    <div class="bar d-flex flex-column" v-if="toggled">
      <div class="d-flex flex-row">
        <button class="btn btn-link menubutton" @click="toggled = !toggled" v-if="toggled">
          <EpMaterialIcon>menu</EpMaterialIcon>
        </button>
      </div>
      <slot name="bar" class="flex-fill"></slot>
    </div>
    <div class="view" ref="content">
      <slot name="view"></slot>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';
import { Kommentit } from '@shared/stores/kommentit';
import { setItem, getItem } from '@/utils/localstorage';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

interface SidenavLocalStorage {
  enabled: boolean;
}

const SidenavLocalStorageStr = 'sidenav';

@Component({
  components: {
    EpMaterialIcon,
  },
  directives: {
    Sticky,
  },
})
export default class EpSidebar extends Vue {
  private width = window.innerWidth;
  private toggled = false;

  public mounted() {
    window.addEventListener('resize', this.onResize);
    Kommentit.attach(this.$refs.content as Element);
    const sidenavLocalStorage = getItem<SidenavLocalStorage>(SidenavLocalStorageStr, {
      enabled: false,
    });

    if (sidenavLocalStorage) {
      this.toggled = sidenavLocalStorage.enabled;
    }
    this.onResize();
  }

  @Watch('toggled')
  onToggle(newVal, oldVal) {
    if (newVal !== oldVal) {
      setItem(SidenavLocalStorageStr, {
        enabled: newVal,
      });
    }
  }

  public beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    Kommentit.detach();
  }

  private onResize() {
    this.toggled = window.innerWidth > 991;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.sidenav {
  .menubutton:focus {
    outline: -webkit-focus-ring-color auto 1px;
  }
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
