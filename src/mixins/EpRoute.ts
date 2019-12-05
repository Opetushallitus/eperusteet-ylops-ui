import { Watch, Vue, Component } from 'vue-property-decorator';
import { delay } from '@shared/utils/delay';
import _ from 'lodash';
import EpRoot from './EpRoot';
import { Murupolku } from '@/stores/murupolku';
import { Location } from 'vue-router';


@Component
export default class EpRoute extends EpRoot {
  breadcrumb(key: string, value: any, location?: Location) {
    Murupolku.aseta(key, value, location);
  }
}
