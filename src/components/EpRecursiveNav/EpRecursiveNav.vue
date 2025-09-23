<template>
<div class="valikko">
  <div class="item">
    <slot name="previousLink"
          v-if="curTopItem"
          :itemData="curTopItem"
          :itemRoute="curTopItem.route"
          :navigate="previousSubmenu"></slot>
  </div>
  <div class="item" v-for="(item, idx) in current" :key="idx">
    <slot :itemData="item"
          :isSubmenu="isSubmenu(item)"
          :itemRoute="item.route"
          :navigate="enterSubmenu"></slot>
    <div v-if="item.flatten">
      <div v-for="(subitem, idx) in item.children"
           :key="idx"
           class="subitem">
        <slot :itemData="subitem" :isSubmenu="isSubmenu(subitem)" :itemRoute="subitem.route" :navigate="enterSubmenu"></slot>
      </div>
    </div>
  </div>
  <slot name="after" v-if="curTopItem" :itemData="curTopItem" :itemRoute="curTopItem.route" :navigate="previousSubmenu"></slot>
</div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  SideMenuEntry,
  SideMenuRoute,
} from '@shared/tyypit';

const props = withDefaults(
  defineProps<{
    value?: any[];
  }>(), {
  value: () => [],
});

const router = useRouter();
const route = useRoute();

const valueCopy = ref<Array<SideMenuEntry>>([]);
const current = ref<Array<SideMenuEntry>>([]);
const curTopItem = ref<SideMenuEntry | null>(null);

const previousSubmenu = (changeRoute: boolean) => {
  if (!curTopItem.value) {
    return;
  }

  if (changeRoute && curTopItem.value.route) {
    router.replace({
      name: curTopItem.value.route.name,
      params: {
        ...curTopItem.value.route.params,
      },
    });
  }

  current.value = _.get(curTopItem.value, 'parent.children', valueCopy.value);
  curTopItem.value = _.get(curTopItem.value, 'parent', null);
};

const enterSubmenu = (item: SideMenuEntry) => {
  if (!item.children) {
    return;
  }

  current.value = item.children;
  curTopItem.value = item;
};

const isSubmenu = (item: SideMenuEntry) => {
  return (item.children && item.children.length > 0 && !item.flatten) || item.allowEmpty;
};

watch(() => props.value, () => {
  processNewValue();
});

const processNewValue = () => {
  valueCopy.value = props.value || [];
  addParentRefs(valueCopy.value, null);

  if (route) {
    let { found, newTopItem, newCurrent } = buildCurrentFromRoute(valueCopy.value, curTopItem.value);
    current.value = (found && ((newTopItem as any || {}).allowEmpty || newCurrent.length > 0)) ? newCurrent : valueCopy.value;
    curTopItem.value = newTopItem;
  }
  else {
    current.value = valueCopy.value;
    curTopItem.value = null;
  }
};

const matchRouteName = (routeParam: SideMenuRoute): boolean => {
  // Most trivial check at first: name must match
  return (routeParam.name === route.name && route.matched.length > 0);
};

const splitRouteParams = (): string[] => {
  // Parse mandatory parameters for current path
  const matchedRoute = route.matched[route.matched.length - 1];
  const parentpath = (matchedRoute.parent) ? matchedRoute.parent.path : '';

  return matchedRoute.path
    .replace(parentpath, '')
    .split('/')
    .filter((path) => {
      return path.substr(0, 1) === ':';
    })
    .map(path => {
      return path.substr(1);
    });
};

const matchRouteParams = (routeParam: SideMenuRoute): boolean => {
  return splitRouteParams().every(param => {
    const p1 = _.get(route.params, param, null);
    const p2 = _.get(routeParam.params, param, null);
    return (p1 && p2 && String(p1) === String(p2));
  });
};

const searchForRouteMatch = (menuEntry: SideMenuEntry) => {
  return (menuEntry.route && matchRouteName(menuEntry.route) && matchRouteParams(menuEntry.route));
};

const getEntryDetails = (menuEntry: SideMenuEntry) => {
  let newTopItem: SideMenuEntry | null = null;
  let newCurrent: SideMenuEntry[] = [];
  const parent = menuEntry.parent;

  if (menuEntry.children && !menuEntry.flatten) {
    newTopItem = menuEntry;
    newCurrent = menuEntry.children;
  }
  else if (parent) {
    if (parent.flatten && parent.parent && parent.parent.children) {
      newTopItem = parent.parent;
      newCurrent = parent.parent.children;
    }
    else if (!parent.flatten && parent.children) {
      newTopItem = parent;
      newCurrent = parent.children;
    }
  }

  return { found: true, newTopItem, newCurrent };
};

const buildCurrentFromRoute = (menuData: SideMenuEntry[], curTopItemParam: SideMenuEntry | null) => {
  var found: boolean = false;
  var newTopItem: SideMenuEntry | null = null;
  var newCurrent: SideMenuEntry[] = [];

  menuData.every(menuItem => {
    if (searchForRouteMatch(menuItem)) {
      const retval = getEntryDetails(menuItem);
      found = true;
      newTopItem = retval.newTopItem;
      newCurrent = retval.newCurrent;
      return false;
    }

    // Iterate children (if any)
    if (menuItem.children) {
      const retval = buildCurrentFromRoute(menuItem.children, curTopItemParam);
      if (retval.found) {
        found = true;
        newTopItem = retval.newTopItem;
        newCurrent = retval.newCurrent;
        return false;
      }
    }

    // use defined parent navigation if nothing else is found
    if (route?.meta?.parentNavigation) {
      if (menuItem.route && menuItem.route.name === route.meta.parentNavigation) {
        const retval = getEntryDetails(menuItem);
        found = true;
        newTopItem = retval.newTopItem;
        newCurrent = retval.newCurrent;
        return false;
      }
    }

    return true;
  });

  // Return search results
  return { found, newTopItem, newCurrent };
};

const addParentRefs = (menuData: SideMenuEntry[], parent: SideMenuEntry | null) => {
  menuData.forEach(menuItem => {
    if (parent) {
      menuItem.parent = parent;
    }

    if (menuItem.children) {
      addParentRefs(menuItem.children, menuItem);
    }
  });
};

onMounted(() => {
  processNewValue();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
.valikko {
  margin-top: 15px;
}
</style>
