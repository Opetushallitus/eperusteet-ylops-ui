import { Vue, Component, Prop } from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';
import { Kommentit } from '@/stores/kommentit';


@Component({
  directives: {
    Sticky,
  },
})
export default class EpSidebar extends Vue {
  private width = window.innerWidth;
  private toggled = true;

  public mounted() {
    window.addEventListener('resize', this.onResize);
    Kommentit.attach(this.$refs.content as Element);
  }

  public beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    Kommentit.detach();
  }

  private onResize(data: Event) {
    const newWidth = window.innerWidth;
    if (this.width >= 768 && newWidth < 768) {
      this.toggled = false;
    }
    if (this.width < 768 && newWidth >= 768) {
      this.toggled = true;
    }

    this.width = newWidth;
  }
}
