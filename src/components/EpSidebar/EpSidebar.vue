<template>
  <div>
    <div class="sidenav d-flex">
      <div class="closed">
        <button
          v-if="!toggled"
          class="btn btn-link menubutton"
          @click="toggled = !toggled"
        >
          <span class="bar">
            <EpMaterialIcon>menu</EpMaterialIcon>
          </span>
        </button>
      </div>
      <div
        v-if="toggled"
        class="bar d-flex flex-column"
      >
        <div class="d-flex flex-row">
          <button
            v-if="toggled"
            class="btn btn-link menubutton"
            @click="toggled = !toggled"
          >
            <EpMaterialIcon>menu</EpMaterialIcon>
          </button>
        </div>
        <slot
          name="bar"
          class="flex-fill"
        />
      </div>
      <div
        ref="content"
        class="view"
      >
        <slot name="view" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, useTemplateRef } from 'vue';
import Sticky from 'vue-sticky-directive';
import { Kommentit } from '@/stores/kommentit';
import { setItem, getItem } from '@/utils/localstorage';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

interface SidenavLocalStorage {
  enabled: boolean;
}

const SidenavLocalStorageStr = 'sidenav';

const width = ref(window.innerWidth);
const toggled = ref(false);
const content = useTemplateRef('content');

const onResize = () => {
  toggled.value = window.innerWidth > 991;
};

onMounted(() => {
  window.addEventListener('resize', onResize);
  if (content.value) {
    Kommentit.attach(content.value as Element);
  }
  const sidenavLocalStorage = getItem<SidenavLocalStorage>(SidenavLocalStorageStr, {
    enabled: false,
  });

  if (sidenavLocalStorage) {
    toggled.value = sidenavLocalStorage.enabled;
  }
  onResize();
});

watch(toggled, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    setItem(SidenavLocalStorageStr, {
      enabled: newVal,
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  Kommentit.detach();
});
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
