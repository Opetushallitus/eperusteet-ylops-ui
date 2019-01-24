import { createLocalVue, mount } from '@vue/test-utils';
import { Kielet } from '@/stores/kieli';
import { Kieli } from '@/tyypit';
import Aikaleima from '@/plugins/aikaleima';

describe('Plugin aikaleima', () => {

  const localVue = createLocalVue();

  localVue.use(Aikaleima);

  beforeEach(() => {
    Kielet.setUiKieli(Kieli.fi);
  });

  function mountAikaleima(value: any) {
    return mount({
      template: `<p>{{ $ago(value) }}</p>`,
    }, {localVue});
  }


  test('Epoch aikaleima', async () => {
    const spy = jest.spyOn(Date, 'now');
    spy.mockImplementation(() => 1546870463248);

    let element = mountAikaleima(1546870463248);

    expect(element.text()).toEqual('muutama sekunti sitten');

    Kielet.setUiKieli(Kieli.sv);
    element = mountAikaleima(1546870463248);
    expect(element.text()).toEqual('för några sekunder sedan');
  });

});
