import { Watch, Vue, Component } from 'vue-property-decorator';
import { delay } from '@/utils/delay';
import _ from 'lodash';

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteUpdate',
  'beforeRouteLeave',
]);

@Component
export default class EpRoot extends Vue {
  private mIsLoading = true;
  private mError = null;

  public async beforeRouteEnter(to: any, from: any, next: any) {
    next();
  }

  public async beforeRouteUpdate(to: any, from: any, next: any) {
    next();
  }

  public async beforeRouteLeave(to: any, from: any, next: any) {
    next();
  }

  public async mounted() {
    this.loading(this.init);
  }

  public async loading(
    fn: () => Promise<void>
  ) {
    this.mIsLoading = true;
    try {
      await fn();
    }
    catch (err) {
      this.mError = null;
    }
    finally {
      this.mIsLoading = false;
    }
  }

  public get isLoading() {
    return this.mIsLoading;
  }

  public get error() {
    return this.mError;
  }

  protected async init() { }
}
