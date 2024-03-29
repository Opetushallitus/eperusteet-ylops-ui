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

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import {
  SideMenuEntry,
  SideMenuRoute,
} from '@shared/tyypit';

@Component
export default class EpRecursiveNav extends Vue {
  @Prop({ default: [] })
  private value: any;

  private valueCopy: Array<SideMenuEntry> = [];
  private current: Array<SideMenuEntry> = [];
  private curTopItem: SideMenuEntry | null = null;

  public created() {
    this.processNewValue();
  }

  public previousSubmenu(changeRoute: boolean) {
    if (!this.curTopItem) {
      return;
    }

    if (changeRoute && this.curTopItem.route) {
      this.$router.replace({
        name: this.curTopItem.route.name,
        params: {
          ...this.curTopItem.route.params,
        },
      });
    }

    this.current = _.get(this.curTopItem, 'parent.children', this.valueCopy);
    this.curTopItem = _.get(this.curTopItem, 'parent', null);
  }

  public enterSubmenu(item: SideMenuEntry) {
    if (!item.children) {
      return;
    }

    this.current = item.children;
    this.curTopItem = item;
  }

  private isSubmenu(item: SideMenuEntry) {
    return (item.children && item.children.length > 0 && !item.flatten) || item.allowEmpty;
  }

  @Watch('value')
  private onValueChange() {
    this.processNewValue();
  }

  private processNewValue() {
    this.valueCopy = this.value;
    this.addParentRefs(this.valueCopy, null);

    if (this.$route) {
      let { found, newTopItem, newCurrent } = this.buildCurrentFromRoute(this.valueCopy, this.curTopItem);
      this.current = (found && ((newTopItem as any || {}).allowEmpty || newCurrent.length > 0)) ? newCurrent : this.valueCopy;
      this.curTopItem = newTopItem;
    }
    else {
      this.current = this.valueCopy;
      this.curTopItem = null;
    }
  }

  private matchRouteName(route: SideMenuRoute): boolean {
    // Most trivial check at first: name must match
    return (route.name === this.$route.name && this.$route.matched.length > 0);
  }

  private splitRouteParams(): string[] {
    // Parse mandatory parameters for current path
    const matchedRoute = this.$route.matched[this.$route.matched.length - 1];
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
  }

  private matchRouteParams(route: SideMenuRoute): boolean {
    return this.splitRouteParams().every(param => {
      const p1 = _.get(this.$route.params, param, null);
      const p2 = _.get(route.params, param, null);
      return (p1 && p2 && String(p1) === String(p2));
    });
  }

  private searchForRouteMatch(menuEntry: SideMenuEntry) {
    return (menuEntry.route && this.matchRouteName(menuEntry.route) && this.matchRouteParams(menuEntry.route));
  }

  private getEntryDetails(menuEntry: SideMenuEntry) {
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
  }

  private buildCurrentFromRoute(menuData: SideMenuEntry[], curTopItem: SideMenuEntry | null) {
    var found: boolean = false;
    var newTopItem: SideMenuEntry | null = null;
    var newCurrent: SideMenuEntry[] = [];

    menuData.every(menuItem => {
      if (this.searchForRouteMatch(menuItem)) {
        const retval = this.getEntryDetails(menuItem);
        found = true;
        newTopItem = retval.newTopItem;
        newCurrent = retval.newCurrent;
        return false;
      }

      // Iterate children (if any)
      if (menuItem.children) {
        const retval = this.buildCurrentFromRoute(menuItem.children, curTopItem);
        if (retval.found) {
          found = true;
          newTopItem = retval.newTopItem;
          newCurrent = retval.newCurrent;
          return false;
        }
      }

      // use defined parent navigation if nothing else is found
      if (this.$route?.meta?.parentNavigation) {
        if (menuItem.route && menuItem.route.name === this.$route.meta.parentNavigation) {
          const retval = this.getEntryDetails(menuItem);
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
  }

  private addParentRefs(menuData: SideMenuEntry[], parent: SideMenuEntry | null) {
    menuData.forEach(menuItem => {
      if (parent) {
        menuItem.parent = parent;
      }

      if (menuItem.children) {
        this.addParentRefs(menuItem.children, menuItem);
      }
    });
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
.valikko {
  margin-top: 15px;
}
</style>
