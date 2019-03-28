import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class EpRecursiveNav extends Vue {
  @Prop({ default: [] })
  private value: any;

  private valueCopy: any = [];
  private current: any = [];
  private curTopItem: any = false;

  public beforeMount() {
    this.processNewValue();
  }

  public previousSubmenu() {
    this.curTopItem = this.curTopItem.parent ? this.curTopItem.parent : false;
    this.current = this.curTopItem.parent ? this.curTopItem.parent.children : this.valueCopy;
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
    this.processNewValue();
  }

  private processNewValue() {
    this.valueCopy = this.value;
    this.addParentRefs(this.valueCopy, null);

    let { found, newTopItem, newCurrent } = this.buildCurrentFromRoute(this.valueCopy, this.curTopItem);
    this.current = (found && newCurrent !== null) ? newCurrent : this.valueCopy;
    this.curTopItem = newTopItem;
  }

  private matchRouteName(route: any): boolean {
    // Structure of route information is valid?
    if (!route || !route.name || !this.$route) {
      return false;
    }

    // Most trivial check at first: name must match
    if (route.name !== this.$route.name || this.$route.matched.length === 0) {
      return false;
    }

    return true;
  }

  private splitRouteParams(): Array<string> {
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

  private matchRouteParams(route: any): boolean {
    const pathParams = this.splitRouteParams();

    // Something wrong with either current route, or route to match
    if (pathParams.length > 0 && (!this.$route.params || !route.params)) {
      return false;
    }

    // Compare route parameters
    for (let param of pathParams) {
      if (!this.$route.params[param] || !route.params[param]) {
        return false;
      }

      if (this.$route.params[param] !== String(route.params[param])) {
        return false;
      }
    }

    return true;
  }

  private buildCurrentFromRoute(menuData: any, curTopItem: any) {
    var found: boolean = false;
    var newTopItem: any = false;
    var newCurrent: any = null;

    for (let menuItem of menuData) {
      if (this.matchRouteName(menuItem.route) && this.matchRouteParams(menuItem.route)) {
        found = true;

        if (!menuItem.parent) {
          break;
        }

        if (menuItem.parent.flatten) {
          if (menuItem.parent.parent) {
            newTopItem = menuItem.parent.parent;
            newCurrent = menuItem.parent.parent.children;
          }
          break;
        }

        newTopItem = menuItem.parent;
        newCurrent = menuItem.parent.children;
        break;
      }

      // Iterate children (if any)
      if (menuItem.children) {
        const retval = this.buildCurrentFromRoute(menuItem.children, curTopItem);
        if (!retval.found) {
          continue;
        }

        found = retval.found;
        newTopItem = retval.newTopItem;
        newCurrent = retval.newCurrent;
        break;
      }
    }

    // Return search results
    return { found, newTopItem, newCurrent };
  }

  private addParentRefs(menuData: any, parent: any) {
    for (let menuItem of menuData) {
      menuItem.parent = parent;

      if (menuItem.children) {
        this.addParentRefs(menuItem.children, menuItem);
      }
    }
  }
}
