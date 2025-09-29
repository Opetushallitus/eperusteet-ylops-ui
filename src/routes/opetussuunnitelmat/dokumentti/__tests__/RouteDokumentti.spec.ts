import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { vi } from 'vitest';
import RouteDokumentti from '../RouteDokumentti.vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { Kielet } from '@shared/stores/kieli';
import { Dokumentit } from '@shared/api/ylops';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { makeAxiosResponse } from '&/utils/data';

describe('RouteDokumentti', () => {
  OpetussuunnitelmaStore.prototype.init = vi.fn();

  // Mock all Dokumentit API calls to prevent network errors and Pinia issues
  vi.spyOn(Dokumentit, 'getDokumenttiKuva').mockResolvedValue(makeAxiosResponse({}));
  vi.spyOn(Dokumentit, 'getJulkaistuDokumentti').mockResolvedValue(makeAxiosResponse({}));
  vi.spyOn(Dokumentit, 'getLatestDokumentti').mockResolvedValue(makeAxiosResponse({}));
  vi.spyOn(Dokumentit, 'create').mockResolvedValue(makeAxiosResponse({}));

  const opetussuunnitelmaStore = new OpetussuunnitelmaStore();

  test('mounting', async () => {
    // Set the internal state directly for testing
    (opetussuunnitelmaStore as any).state.opsId = 42;
    (opetussuunnitelmaStore as any).state.opetussuunnitelma = {
      id: 42,
      nimi: {
        fi: 'nimi',
      } as any,
    };

    const wrapper = mount(RouteDokumentti as any, {
      global: {
        ...globalStubs,
        mocks: {
          $route: {
            params: {
              id: 1,
            },
          },
        },
      },
      props: {
        opetussuunnitelmaStore,
      },
    } as any);

    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });
});
