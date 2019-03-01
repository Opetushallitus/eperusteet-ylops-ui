import { mount } from '@vue/test-utils';
import EpChartTester from './EpChart.tester.vue';
import { DiagrammiVarit } from '@/tyypit';

describe('EpChart component', () => {
  it('Renders canvas element', () => {
    const wrapper = mount(EpChartTester, {
      propsData: {
        chartColor: DiagrammiVarit.vaalea_sininen,
      },
    });
    expect(wrapper.find('#doughnut-chart').is('canvas') ).toBe(true);

    // Canvas elementti on mock versio, eli varsinaisesti sisällön muuttumista ei
    // näy mistään
    wrapper.setProps({
      value: -1,
    });
    expect(wrapper.find('#doughnut-chart').is('canvas') ).toBe(true);

    // Sama vika kuin edellisessä
    wrapper.setProps({
      value: 30,
    });
    expect(wrapper.find('#doughnut-chart').is('canvas') ).toBe(true);

  });
});
