import { mount } from '@vue/test-utils';
import OpsSidenav from './OpsSidenav.vue';
import router from '@/router/router';
import { PerusteCache } from '@/stores/peruste';
import { Kielet } from '@shared/stores/kieli';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { Opetussuunnitelmat, OpetussuunnitelmanSisalto, Termisto } from '@shared/api/ylops';
import { makeAxiosResponse } from '&/utils/data';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { vi } from 'vitest';

vi.mock('vue3-text-clamp', () => ({
  default: {
    install: vi.fn(),
  },
}));

describe('OpsSidenav component', () => {
  vi.spyOn(Termisto, 'getAllTermit')
    .mockImplementation(async (id: number) => {
      return makeAxiosResponse([{
      }]);
    });

  vi.spyOn(OpetussuunnitelmanSisalto, 'getTekstiOtsikot')
    .mockImplementation(async (id: number) => {
      return makeAxiosResponse({
        id: id,
        nimi: {
          fi: 'Ops',
        } as any,
      });
    });

  vi.spyOn(Opetussuunnitelmat, 'getOpetussuunnitelma')
    .mockImplementation(async (id: number) => {
      return makeAxiosResponse({
        id: id,
        nimi: {
          fi: 'Ops',
        } as any,
      });
    });

  test('navigates the menu structure properly', async () => {
    vi.spyOn(PerusteCache, 'of')
      .mockImplementation(async () => new PerusteCache(1));

    const opetussuunnitelmaStore = new OpetussuunnitelmaStore();

    const wrapper = mount(OpsSidenav as any, {
      global: {
        ...globalStubs,
        plugins: [
          ...(globalStubs.plugins || []),
          router,
        ],
      },
      props: {
        opetussuunnitelmaStore,
      },
    } as any);

    expect(wrapper.html()).toContain('oph-spinner');
  });
});
