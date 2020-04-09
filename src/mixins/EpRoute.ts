import { Component } from 'vue-property-decorator';
import EpRoot from './EpRoot';
import { Murupolku } from '@/stores/murupolku';
import { Location } from 'vue-router';

@Component
export default class EpRoute extends EpRoot {
  breadcrumb(key: string, value: any, location?: Location) {
    Murupolku.aseta(key, value, location);
  }
}
