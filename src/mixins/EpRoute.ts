import { Watch, Vue, Component } from 'vue-property-decorator';
import { delay } from '@/utils/delay';
import _ from 'lodash';
import EpRoot from './EpRoot';
import { Murupolku } from '@/stores/murupolku';

// Component.registerHooks([
//   'beforeRouteEnter',
//   'beforeRouteUpdate',
//   'beforeRouteLeave',
// ]);

@Component
export default class EpRoute extends EpRoot {
  breadcrumb(key: string, value: any) {
    Murupolku.aseta(key, value);
  }
}
