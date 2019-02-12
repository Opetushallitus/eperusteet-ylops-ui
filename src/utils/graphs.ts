import _ from 'lodash';


const radialChart = {
  height: 120,
  series: [70],
  options: {
    labels: [''],
    colors: ['#5BCA13'],
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
        track: {
          show: true,
          strokeWidth: 100,
          size: 100,
          background: '#0041DC',
        },
        stroke: {
          show: false,
          width: 20,
        },
        startAngle: 0,
        endAngle: 360,
        dataLabels: {
          name: {
          },
          value: {
            offsetY: -5,
            color: '#fff',
            fontSize: '30px',
          },
        },
      },
    },
  },
};

export function roundChart(label: string) {
  return _.cloneDeep(radialChart);
}

export function bigChart(label: string) {
  return _.cloneDeep({
    ...radialChart,
    height: 200,
  });
}
