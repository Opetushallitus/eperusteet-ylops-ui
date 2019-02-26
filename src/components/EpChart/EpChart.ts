import { Doughnut } from 'vue-chartjs';
import { DiagrammiVarit } from '@/tyypit';

import 'chartjs-plugin-doughnutlabel';

export default {
  extends: Doughnut,

  props: {
    value: {
      type: Number,
      default: 0,
    },
    chartColor: {
      type: String,
      default: DiagrammiVarit.vaalea_sininen
    },
    labelColor: {
      type: String,
      default: 'black'
    },
    labelSize: {
      type: Number,
      default: 30,
    },
    styles: {
      type: Object,
      default: () => ({
        width: '100%',
        height: '100%',
        position: 'relative',
      }),
    },
  },

  data () {
    var chartValue: number = (this as any).getValidatedChartValue();

    return {
      componentData: {
        datasets: (this as any).createInitialData(chartValue, (this as any).chartColor),
      },

      componentOptions: (this as any).createInitialConfig(
        chartValue,
        (this as any).labelColor,
        (this as any).labelSize)
    };
  },

  watch: {
    value() {
      var chartValue: number = (this as any).getValidatedChartValue();

      (this as any).componentData.datasets[0].data = [
        chartValue,
        100-chartValue,
      ];
      (this as any).componentOptions.plugins.doughnutlabel.labels[0].text=chartValue+' %';

      (this as any).$data._chart.update();
    }
  },

  mounted () {
    (this as any).renderChart( (this as any).componentData, (this as any).componentOptions );
  },

  methods: {
    getValidatedChartValue() {
      var chartVal: number = (this as any).value ? (this as any).value : 0
      return chartVal >= 0 && chartVal <= 100 ? chartVal : 0;
    },

    // Luodaan graafin data objektin sisältö (värimaailma + piirakan koko)
    createInitialData (chartValue: number, chartColor: String) {
      // Oletuksena sini-vihreä värimaailma
      var varimaailma = [ '#5BCA13', '#0041DC'];

      if(chartColor === DiagrammiVarit.vaalea_sininen) {
        varimaailma = [ '#2e44d8','#cfd8f6' ]
      }

      return [
        {
          borderWidth: 0,
          backgroundColor: varimaailma,
          data: [chartValue, 100-chartValue]
        }
      ];
    },

    // Luodaan graafin konfiguraatio-objektin sisältö
    createInitialConfig (chartValue: number, labelColor: String, labelSize: Number) {
      return {
        cutoutPercentage: 85,

        tooltips: {
          enabled: false,
        },

        hover: {
          mode: null,
        },

        plugins: {
          doughnutlabel: {
            labels: [
              {
                text: chartValue+' %',
                color: labelColor,
                font: {
                  size: labelSize,
                }
              },
            ]
          },
        },
      };
    },

  },
}
