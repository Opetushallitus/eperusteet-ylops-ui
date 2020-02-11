import { Component, Vue } from 'vue-property-decorator';
import { createLogger } from '@shared/utils/logger';

const logger = createLogger('Virhe');

@Component
export default class VirheRoute extends Vue {
  private error: any = {};

  public mounted() {
    try {
      this.error = JSON.parse((this as any).$route.query.virhe);
    }
    catch (err) {
      logger.error(err);
    }
  }
}
