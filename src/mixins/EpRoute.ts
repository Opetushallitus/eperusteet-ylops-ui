import { Watch, Vue, Component } from 'vue-property-decorator';
import { delay } from '@/utils/delay';
import _ from 'lodash';
import EpRoot from './EpRoot';

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteUpdate',
  'beforeRouteLeave',
]);

@Component
export default class EpRoute extends EpRoot {
  public async beforeRouteEnter(to: any, from: any, next: any) {
    next();
  }

  public async beforeRouteUpdate(to: any, from: any, next: any) {
    await next();
    this.init();
  }

  public async beforeRouteLeave(to: any, from: any, next: any) {
    next();
  }

}
