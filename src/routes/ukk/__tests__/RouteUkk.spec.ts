import { makeAxiosResponse } from '&/utils/data';
import { mount, flushPromises } from '@vue/test-utils';
import RouteUkk from '../RouteUkk.vue';
import { Kielet } from '@shared/stores/kieli';
import { Ulkopuoliset, Kysymykset } from '@shared/api/ylops';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { vi } from 'vitest';
import { nextTick } from 'vue';

describe('RouteUkk', () => {
  async function createMounted() {
    vi.spyOn(Ulkopuoliset, 'getUserOrganisations')
      .mockImplementation(async () => makeAxiosResponse([{
        oid: '123',
        nimi: { fi: 'Testiorgi' },
      }]));

    vi.spyOn(Kysymykset, 'createKysymys')
      .mockImplementation(async (x: any) => makeAxiosResponse(x));

    vi.spyOn(Kysymykset, 'updateKysymys')
      .mockImplementation(async (x: any) => makeAxiosResponse(x));

    vi.spyOn(Kysymykset, 'deleteKysymys')
      .mockImplementation(async (x: any) => makeAxiosResponse(null as any));

    vi.spyOn(Kysymykset, 'getKysymykset')
      .mockImplementation(async () => makeAxiosResponse([{
        id: 1,
        kysymys: { fi: 'kysymys?' },
        vastaus: 'vastaus!',
        luotu: new Date().getTime(),
        organisaatiot: [{
          oid: '123',
        }],
      }] as any));

    return mount(RouteUkk as any, {
      global: {
        ...globalStubs,
        stubs: {
          ...globalStubs.stubs,
          'EpSelect': true,
          'EpNavigation': true,
          'EpContent': true,
        },
      },
    } as any);
  }

  test('Rendering', async () => {
    const wrapper = await createMounted();

    // Wait for all promises to resolve (onMounted async operations)
    await flushPromises();
    await nextTick();

    expect(wrapper.html()).toContain('kysymys?');
    expect(wrapper.html()).toContain('vastaus!');
  });
});
