import { Vue, Component } from 'vue-property-decorator';
import { delay } from '@/utils/delay';


@Component
export default class EpRoot extends Vue {
  private mIsLoading = true;
  private mError = null;

  public async loading(
    fn: () => Promise<void>,
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

  private async mounted() {
    this.loading(this.init);
  }
}
