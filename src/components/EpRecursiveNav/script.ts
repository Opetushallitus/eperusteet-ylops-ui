import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class EpRecursiveNav extends Vue {
  @Prop({ default: [] })
  private value: any;

  private current: any = [];
  private navStack: any = [];
  private previous: any = {};

  public beforeMount() {
    this.current = this.value;
  }

  public palaaTakaisin() {
    const stackData = this.navStack.pop();
    this.current = stackData.curPos;
    if (this.navStack.length > 0) {
      this.previous = this.navStack[this.navStack.length - 1].item;
    }
    else {
      this.previous = {};
    }
  }

  public vaihdaValikkoa(item: any, childGroup: any) {
    this.navStack.push({ item, curPos: this.current });
    this.current = childGroup;
    this.previous = item;
  }

  private isSubmenu(item: any) {
    return (item.children && item.children.length > 0 && !item.flatten);
  }
}
