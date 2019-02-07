const radialChart = {
  height: 120,
  series: [70],
  options: {
    labels: [''],
    // colors: [''],
    plotOptions: {
      radialBar: {
        hollow: {
          size: '50%',
        },
        track: {
          show: true,
          strokeWidth: 100,
          size: 100,
        },
        stroke: {
          show: false,
          width: 20,
        },
        startAngle: -180,
        endAngle: 180,
        dataLabels: {
          name: {
            fontSize: '0px',
          },
          total: {
            show: true,
            formatter(value: any) {
              return '';
            },
          },
        },
      },
    },
  },
};

export function roundChart(label: string) {
  return radialChart;
}
