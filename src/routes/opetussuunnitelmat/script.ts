import EpRoute from '@/mixins/EpRoot';
import OpsSidenav from './OpsSidenav.vue';
import Tilanvaihto from './Tilanvaihto.vue';
import _ from 'lodash';
import { DiagrammiVarit } from '@/tyypit';
import { Mixins, Component } from 'vue-property-decorator';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import {
  EpChart,
  EpNavigation,
  EpSidebar,
  EpSpinner,
} from '@/components';

@Component({
  components: {
    EpChart,
    EpNavigation,
    EpSidebar,
    EpSpinner,
    OpsSidenav,
    Tilanvaihto,
  },
})
export default class RouteOpetussuunnitelma extends Mixins(EpRoute) {
  get graph() {
    return {
      colorScheme: 'vihrea_sininen',
      value: 80,
    };
  }

  private get ops() {
    return Opetussuunnitelma.opetussuunnitelma;
  }

  protected async init() {
    const id = this.$route.params.id;
    await Opetussuunnitelma.init(_.parseInt(id));
  }
}
