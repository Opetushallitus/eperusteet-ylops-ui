import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class EpRecursiveNav extends Vue {
  @Prop({ default: [] })
  private value: any;

  private current: any = [];
  private curTopItem: any = false;

  public beforeMount() {
    let { found, newTopItem, newCurrent } = this.buildCurrentFromRoute(this.value, this.curTopItem);
    this.current = (found && newCurrent !== null) ? newCurrent : this.value;
    this.curTopItem = newTopItem;
  }

  public previousSubmenu() {
    if (!this.curTopItem.parent) {
      this.curTopItem = false;
      this.current = this.value;
    }
    else {
      const parent = this.curTopItem.parent;
      this.current = parent.children;
      this.curTopItem = parent;
    }
  }

  public enterSubmenu(item: any) {
    this.current = item.children;
    this.curTopItem = item;
  }

  private isSubmenu(item: any) {
    return (item.children && item.children.length > 0 && !item.flatten);
  }

  @Watch('value')
  private onValueChange() {
    let { found, newTopItem, newCurrent } = this.buildCurrentFromRoute(this.value, this.curTopItem);
    this.current = (found && newCurrent !== null) ? newCurrent : this.value;
    this.curTopItem = newTopItem;
  }

  private matchRoute(route: any): boolean {
    if (!route || !route.name || !this.$route || route.name !== this.$route.name || this.$route.matched.length === 0) {
      return false;
    }

    // Parse mandatory parameters for current path
    const matchedRoute = this.$route.matched[this.$route.matched.length - 1];
    const parentpath = (matchedRoute.parent) ? matchedRoute.parent.path : '';
    const pathParams = matchedRoute.path
      .replace(parentpath, '')
      .split('/')
      .filter((path) => {
        return path.substr(0, 1) === ':';
      })
      .map(path => {
        return path.substr(1);
      });

    // Route does not require parameters
    if (pathParams.length === 0) {
      return true;
    }

    // Something wrong with either current route, or route to match
    if (!this.$route.params || !route.params) {
      return false;
    }

    // Compare route parameters
    for (let param of pathParams) {
      if (!this.$route.params[param] || !route.params[param] || this.$route.params[param] !== route.params[param]) {
        return false;
      }
    }

    return true;
  }

  private buildCurrentFromRoute(menuData: any, curTopItem: any) {
    for (let menuItem of menuData) {
      if (menuItem.route && this.matchRoute(menuItem.route)) {
        if (!menuItem.parent) {
          return { found: true, newTopItem: false, newCurrent: null };
        }

        if (menuItem.parent.flatten) {
          return {
            found: true,
            newTopItem: menuItem.parent.parent ? menuItem.parent.parent : false,
            newCurrent: menuItem.parent.parent ? menuItem.parent.parent.children : null,
          };
        }

        return {
          found: true,
          newTopItem: menuItem.parent,
          newCurrent: menuItem.parent.children,
        };
      }

      // Iterate children (if any)
      if (menuItem.children) {
        let { found, newTopItem, newCurrent } = this.buildCurrentFromRoute(menuItem.children, curTopItem);
        if (found) {
          return { found, newTopItem, newCurrent };
        }
      }
    }

    // Nothing found
    return {
      found: false,
      newTopItem: false,
      newCurrent: null,
    };
  }
}
