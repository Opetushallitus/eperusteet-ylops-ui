<template>
  <component
    :is="tag"
    :class="{ 'router-link-exact-active': isExactRoute }"
    @click="handleClick"
  >
    <div
      v-if="to"
      class="menu-item w-100"
    >
      <router-link :to="to">
        <slot />
      </router-link>
    </div>
    <slot v-else />
  </component>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Kielet } from '@shared/stores/kieli';
import { SideMenuEntry } from '@shared/tyypit';

const props = withDefaults(
  defineProps<{
    to?: any;
    click?: any;
    clickParams?: any;
    tag?: string;
    itemData?: SideMenuEntry;
  }>(), {
    clickParams: null,
    tag: 'li',
  });

const router = useRouter();
const route = useRoute();

const linkRoute = ref<any>(null);

const handleClick = async (e: Event) => {
  if (props.click) {
    await props.click(props.clickParams ? props.clickParams : props.itemData);
    e.preventDefault();
  }
};

const resolveRoute = () => {
  if (!route) {
    return;
  }

  linkRoute.value = router.resolve({
    name: props.to.name,
    params: {
      ...props.to.params,
      lang: Kielet.getUiKieli.value,
      id: route.params.id,
    },
    query: props.to.query,
  });
};

const isExactRoute = computed(() => {
  const path = _.get(linkRoute.value, 'resolved.path', null);
  return (path && route.fullPath === path);
});

onMounted(() => {
  if (props.to) {
    resolveRoute();
  }
});

watch(route, () => {
  // This happens for ex. when changing ui language
  if (props.to) {
    resolveRoute();
  }
});

watch(() => props.to, () => {
  // This happens, when vue recycles component
  if (props.to) {
    resolveRoute();
  }
  else {
    linkRoute.value = null;
  }
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
  .menu-item {
    font-size: 14px;
    padding-top: 0px;
    padding-bottom: 14px;
    a {
      color: #000;

      &.router-link-exact-active {
        font-weight: 700;
        color: #0041DC;
      }
    }
  }
</style>
