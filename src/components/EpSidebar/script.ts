import { Vue, Component, Prop, Watch} from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';
import { Kommentit } from '@/stores/kommentit';
import { setItem, getItem } from '@/utils/localstorage';


interface SidenavLocalStorage {
  enabled: boolean;
}

const SidenavLocalStorageStr = 'sidenav';


@Component({
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
