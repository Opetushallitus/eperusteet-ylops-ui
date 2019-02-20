import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';

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
  private get ops() {
    return Opetussuunnitelma.opetussuunnitelma;
  }

  protected async init() {
    const id = this.$route.params.id;
    await Opetussuunnitelma.init(_.parseInt(id));
  }

}
