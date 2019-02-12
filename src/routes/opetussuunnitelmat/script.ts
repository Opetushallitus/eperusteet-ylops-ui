import { Mixins, Component } from 'vue-property-decorator';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import EpRoute from '@/mixins/EpRoot';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import VueApexCharts from 'vue-apexcharts';
import _ from 'lodash';
import { bigChart } from '@/utils/graphs';


@Component({
  components: {
    EpSpinner,
    apexchart: VueApexCharts,
  },
})
export default class RouteOpetussuunnitelma extends Mixins(EpRoute) {
  get graph() {
    const chart = bigChart('');
    return {
      ...chart,
      series: [75],
      options: {
        ...chart.options,
      },
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
