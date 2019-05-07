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
}
