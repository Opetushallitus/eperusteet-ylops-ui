import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class EpRecursiveNav extends Vue {
  @Prop({ default: () => [] })
  private value: any;

  private current: any;
  private navStack: any = [];
  private previous: any = {};

  public beforeMount() {
    this.current = this.value;
  }

  public palaaTakaisin() {
    const stackData = this.navStack.pop();
    this.current = stackData.curPos;
    if (this.navStack.length > 0) {
      this.previous = this.navStack.splice(-1)[0].item;
    }
    else {
      this.previous = {};
    }
    this.$forceUpdate();
  }

  public vaihdaValikkoa(item: any, childGroup: any) {
    this.navStack.push({ item, curPos: this.current });
    this.current = childGroup;
    this.previous = item;
    this.$forceUpdate();
  }

  private isSubmenu(item: any) {
    return (item.children && item.children.length > 0 && !item.flatten);
  }
}
