import { Component, Vue } from 'vue-property-decorator';
import { createLogger } from '@/stores/logger';

const logger = createLogger('Virhe');

@Component
export default class VirheRoute extends Vue {
  private error: any = {};

  public mounted() {
    try {
      this.error = JSON.parse((this.$route.query as any).virhe);
    }
    catch (err) {
      logger.error(err);
    }
  }
}
