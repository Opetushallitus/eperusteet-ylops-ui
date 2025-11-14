import { mount } from '@vue/test-utils';
import RouteOrganisaatio from '../RouteOrganisaatio.vue';
import { Kielet } from '@shared/stores/kieli';
import { Kayttajat as KayttajatApi, Opetussuunnitelmat, Ulkopuoliset } from '@shared/api/ylops';
import { genKayttaja, makeAxiosResponse } from '&/utils/data';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@shared/utils/delay';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { vi } from 'vitest';
import { nextTick, h, renderSlot } from 'vue';

describe('RouteOrganisaatio', () => {
  async function createMounted() {
    vi.spyOn(KayttajatApi, 'getKayttaja')
      .mockImplementation(async () => makeAxiosResponse(genKayttaja()));

    vi.spyOn(Ulkopuoliset, 'getUserOrganisations')
      .mockImplementation(async () => makeAxiosResponse([{
        oid: '1234',
        nimi: {
          fi: 'organisaatio1',
        },
      }]));

    vi.spyOn(Opetussuunnitelmat, 'getOikeudet')
      .mockImplementation(async () => makeAxiosResponse({}));

    vi.spyOn(Ulkopuoliset, 'getOrganisaatioVirkailijat')
      .mockImplementation(async () => makeAxiosResponse([{
        oid: '1',
        kutsumanimi: 'kutsumanimi1',
        sukunimi: 'sukunimi1',
      }, {
        oid: '2',
        kutsumanimi: 'kutsumanimi2',
        sukunimi: 'sukunimi2',
      }]));

    await Kayttajat.init();
    return mount(RouteOrganisaatio, {
      global: {
        ...globalStubs,
        stubs: {
          ...globalStubs.stubs,
          'EpNavigation': true,
          'EpToggle': {
            render() {
              return h('div', { class: 'ep-toggle-stub' }, [
                renderSlot(this.$slots, 'default'),
              ]);
            },
          },
        },
      },
    });
  }

  test('Renders header and description', async () => {
    const wrapper = await createMounted();
    expect(wrapper.html()).toContain('organisaatio-tyoryhma');
    expect(wrapper.html()).toContain('organisaatio-tyoryhma-kuvaus');
    expect(wrapper.html()).toContain('nayta-organisaatiot');
  });

  test('Renders virkailijat', async () => {
    const wrapper = await createMounted();

    await delay();

    expect(wrapper.html()).toContain('kutsumanimi1 sukunimi1');
    expect(wrapper.html()).toContain('kutsumanimi2 sukunimi2');
  });

  test('Renders organizations', async () => {
    const wrapper = await createMounted();

    // Set data using Vue 3 syntax
    (wrapper.vm as any).showOrganizations = true;
    await nextTick();

    await delay();

    expect(wrapper.html()).toContain('kutsumanimi1 sukunimi1');
    expect(wrapper.html()).toContain('kutsumanimi2 sukunimi2');
    expect(wrapper.html()).toContain('organisaatio1');
  });
});
