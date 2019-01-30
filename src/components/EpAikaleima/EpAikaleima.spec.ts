import { createLocalVue, mount } from '@vue/test-utils';
import { i18n, Kielet } from '@/stores/kieli';
import { Kieli } from '@/tyypit';
import EpAikaleima from '@/components/EpAikaleima/EpAikaleima.vue';

describe('EpAikaleima component', () => {

  const localVue = createLocalVue();

  beforeEach(() => {
    // Asetetaan nykyinen aika staattiseksi
    const spy = jest.spyOn(Date, 'now');
    spy.mockImplementation(() => 1546870463248);

    Kielet.setUiKieli(Kieli.fi);
  });

  function mountAikaleima(value: any, template: string) {
    return mount({
      i18n,
      data() {
        return { value };
      },
      components: { EpAikaleima },
      template,
    }, { localVue });
  }

  test('format', () => {
    const wrapper = mountAikaleima(1546870463248,
      `<ep-aikaleima :value="value" format="LLLL"></ep-aikaleima>`);


    expect(wrapper.text()).toEqual('maanantai, 7. tammikuuta 2019, klo 16.14');

    Kielet.setUiKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('måndag 7 januari 2019 kl. 16:14');
  });

  test('ago', () => {
    const wrapper = mountAikaleima(1546870463248,
      `<ep-aikaleima :value="value" type="ago"></ep-aikaleima>`);


    expect(wrapper.text()).toEqual('muutama sekunti sitten');

    Kielet.setUiKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('för några sekunder sedan');
  });

  test('default', () => {
    const wrapper = mountAikaleima(1546870463248,
      `<ep-aikaleima :value="value"></ep-aikaleima>`);


    expect(wrapper.text()).toEqual('7.1.2019 16:14');

    Kielet.setUiKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('7.1.2019 16:14');
  });

  test('ldt', () => {
    const wrapper = mountAikaleima(1546870463248,
      `<ep-aikaleima :value="value" type="ldt"></ep-aikaleima>`);


    expect(wrapper.text()).toEqual('7. tammikuuta 2019, klo 16.14');

    Kielet.setUiKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('7 januari 2019 kl. 16:14');
  });

  test('ld', () => {
    const wrapper = mountAikaleima(1546870463248,
      `<ep-aikaleima :value="value" type="ld"></ep-aikaleima>`);


    expect(wrapper.text()).toEqual('7. tammikuuta 2019');

    Kielet.setUiKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('7 januari 2019');
  });

  test('lt', () => {
    const wrapper = mountAikaleima(1546870463248,
      `<ep-aikaleima :value="value" type="lt"></ep-aikaleima>`);


    expect(wrapper.text()).toEqual('16:14:23');

    Kielet.setUiKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('16:14:23');
  });

  test('sdt', () => {
    const wrapper = mountAikaleima(1546870463248,
      `<ep-aikaleima :value="value" type="sdt"></ep-aikaleima>`);


    expect(wrapper.text()).toEqual('7.1.2019 16:14');

    Kielet.setUiKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('7.1.2019 16:14');
  });

  test('sd', () => {
    const wrapper = mountAikaleima(1546870463248,
      `<ep-aikaleima :value="value" type="sd"></ep-aikaleima>`);


    expect(wrapper.text()).toEqual('7.1.2019');

    Kielet.setUiKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('7.1.2019');
  });

  test('st', () => {
    const wrapper = mountAikaleima(1546870463248,
      `<ep-aikaleima :value="value" type="st"></ep-aikaleima>`);


    expect(wrapper.text()).toEqual('16:14');

    Kielet.setUiKieli(Kieli.sv);
    expect(wrapper.text()).toEqual('16:14');
  });

});
