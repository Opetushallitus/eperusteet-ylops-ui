import { Vue, Component, Prop } from 'vue-property-decorator';
import { setItem, getItem } from '@/utils/localstorage';
import _ from 'lodash';

@Component
export default class EpCollapse extends Vue {
  @Prop({ default: null })
  private defaultState!: boolean | null;

  @Prop({ default: '' })
  private tyyppi!: string;
  private toggled = false;

  isToggled() {
    try {
      if (this.tyyppi) {
        const item = getItem('toggle-' + this.tyyppi);
        if (_.isObject(item)) {
          return (item as any).toggled;
        }
      }
    }
    catch (err) {
      return true;
    }
  }

  mounted() {
    this.toggled = this.defaultState === null
      ? this.isToggled()
      : this.defaultState;
  }

  toggle() {
    this.toggled = !this.toggled;
    if (this.tyyppi) {
      setItem('toggle-' + this.tyyppi, {
        toggled: this.toggled,
      });
    }
  }
}
