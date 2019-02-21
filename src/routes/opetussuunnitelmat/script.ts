import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import { DiagrammiVarit } from '@/tyypit';

import EpRoute from '@/mixins/EpRoot';
import EpChart from '@/components/EpChart/EpChart';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpSidebar from '@/components/EpSidebar/EpSidebar.vue';
import OpsSidenav from './OpsSidenav.vue';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

@Component({
  components: {
    EpSpinner,
    OpsSidenav,
    EpSidebar,
    EpChart,
  },
})
export default class RouteOpetussuunnitelma extends Mixins(EpRoute) {
  get graph() {
    return {
      colorScheme: DiagrammiVarit.vihrea_sininen,
      value: 80,
    }
  }

  private get ops() {
    return Opetussuunnitelma.opetussuunnitelma;
  }

  protected async init() {
    const id = this.$route.params.id;
    await Opetussuunnitelma.init(_.parseInt(id));
  }

}
