import { Doughnut } from 'vue-chartjs';

import 'chartjs-plugin-doughnutlabel';

export default {
  extends: Doughnut,

  props: {
    value: Number,
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
    var chartValue: number = (this as any).value ? (this as any).value : 0;
    if(chartValue < 0 || chartValue > 100) {
      chartValue = 0;
    }

    return {
      componentData: {
        datasets: [
          {
            borderWidth: 0,
            backgroundColor: [ '#5BCA13', '#0041DC'],
            data: [chartValue, 100-chartValue]
          }
        ]
      },

      componentOptions: {
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
                  font: {
                    size: '15',
                  }
                },
              ]
            },
          },
      },
    };
  },

  watch: {
    value() {
      var chartValue: number = this.value ? (this as any).value : 0;
      if(chartValue < 0 || chartValue > 100) {
        chartValue = 0;
      }

      (this as any).componentData.datasets[0].data = [
        chartValue,
        100-chartValue,
      ];
      (this as any).componentOptions.plugins.doughnutlabel.labels[0].text=chartValue+' %';

      (this as any).$data._chart.update();
    }
  },

  created() {

  },

  mounted () {
    (this as any).renderChart( (this as any).componentData, (this as any).componentOptions );
  }
}
