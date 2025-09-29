import { mount } from '@vue/test-utils';
import { Kayttajat } from '@/stores/kayttaja';
import router from '@/router/router';
import { expectEventually } from '&/utils/assertions';
import { Kielet } from '@shared/stores/kieli';
import { Kaannos } from '@shared/plugins/kaannos';
import {
  makeAxiosResponse,
  genOikeudet,
  genKayttaja,
} from '&/utils/data';

import {
  Kayttajat as KayttajatApi,
  Opetussuunnitelmat,
  Ulkopuoliset,
} from '@shared/api/ylops';

import axios from 'axios';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import Root from '@/routes/Root.vue';
import nextTick from 'vue';
import { vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('vue3-text-clamp', () => ({
  default: {
    install: vi.fn(),
  },
}));

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn(),
      },
      response: {
        use: vi.fn(),
        eject: vi.fn(),
      },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
  };

  return {
    default: {
      ...mockAxiosInstance,
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('Router', () => {

  beforeEach(async () => {
    // Create and activate a fresh Pinia instance for each test
    const pinia = createPinia();
    setActivePinia(pinia);

    // Reset all mocks
    vi.clearAllMocks();

    // Mock axios methods
    vi.mocked(axios.get).mockResolvedValue(makeAxiosResponse({}));
    vi.mocked(axios.post).mockResolvedValue(makeAxiosResponse({}));
    vi.mocked(axios.put).mockResolvedValue(makeAxiosResponse({}));
    vi.mocked(axios.delete).mockResolvedValue(makeAxiosResponse({}));

    // Navigate to root after Pinia is set up
    return router.push({
      name: 'root',
      params: {
        lang: 'fi',
      },
    }).catch(err => {
      console.log(err);
    });
  });

  async function createMounted(
    oikeudet = genOikeudet('oph'),
  ) {
    vi.spyOn(KayttajatApi, 'getKayttaja')
      .mockImplementation(async () => makeAxiosResponse(genKayttaja()));

    vi.spyOn(Opetussuunnitelmat, 'getOikeudet')
      .mockImplementation(async () => makeAxiosResponse(oikeudet));

    vi.spyOn(KayttajatApi, 'getKayttajanEtusivu')
      .mockImplementation(async () => makeAxiosResponse({
        opetussuunnitelmatJulkaistut: 42,
        opetussuunnitelmatKeskeneraiset: 43,
        pohjatJulkaistut: 44,
        pohjatKeskeneraiset: 45,
      }));

    vi.spyOn(KayttajatApi, 'getOrganisaatioOikeudet')
      .mockImplementation(async () => makeAxiosResponse([
        '1234',
        '2234',
      ]));

    vi.spyOn(Ulkopuoliset, 'getUserOrganisations')
      .mockImplementation(async () => makeAxiosResponse([
        {
          oid: '1234',
          nimi: {
            fi: '1234nimi',
          },
        },
        {
          oid: '2234',
          nimi: {
            fi: '2234nimi',
          },
        },
      ]));

    vi.spyOn(Ulkopuoliset, 'getOrganisaatioVirkailijat')
      .mockImplementation(async () => makeAxiosResponse([]));

    vi.spyOn(Opetussuunnitelmat, 'getAll')
      .mockImplementation(async (tyyppi: 'OPS' | 'POHJA' | undefined) => {
        if (tyyppi === 'POHJA') {
          return makeAxiosResponse([{
            id: 1,
            perusteenDiaarinumero: 'diaari1234',
            nimi: {
              fi: 'Jokin opetussuunnitelman pohja',
            } as any,
          }]);
        }
        else {
          return makeAxiosResponse([{
            id: 1,
            perusteenDiaarinumero: 'diaari1234',
            nimi: {
              fi: 'Jokin opetussuunnitelma',
            } as any,
          }]);
        }
      });

    vi.spyOn(Opetussuunnitelmat, 'getOpetussuunnitelmaTilastot')
      .mockImplementation(async (): Promise<any> => [
      ]);

    vi.spyOn(Ulkopuoliset, 'getLokalisoinnit')
      .mockImplementation(async () => makeAxiosResponse({}));

    vi.spyOn(Ulkopuoliset, 'getTiedotteetHaku')
      .mockImplementation(async () => makeAxiosResponse({
        data: [{
          julkinen: true,
          yleinen: true,
          otsikko: {
            fi: 'Tämä on tiedote',
            sv: 'Tämä on tiedote',
          },
          koulutustyyppi: 'koulutustyyppi_2',
        }],
      }));

    await Kayttajat.init();
    return mount(Root, {
      global: {
        ...globalStubs,
        plugins: [
          ...(globalStubs.plugins || []),
          router,
        ],
      },
    });
  }

  test('App creation', async () => {
    const spyError = vi.spyOn(console, 'error');
    const app = await createMounted();
    expect(spyError).not.toBeCalled();
    expect(app).toBeTruthy();
  });

  test.skip('Navigaatio - Etusivu', async () => {
    const app = await createMounted();
    expect(router.currentRoute.name).toEqual('root');
    expect(router.currentRoute.params).toEqual({ lang: 'fi' });
    router.push({
      name: 'root',
      params: { lang: 'sv' },
    }).catch(err => {
      console.log(err);
    });

    await nextTick();

    // expect(router.currentRoute.params).toEqual({ lang: 'sv' });

    await expectEventually(() =>
      expect(app.html()).toContain('Hej Keke Käyttäjä, välkommen till läroplansverktyget i eGrunder!'));
    await expectEventually(() => expect(app.html()).toContain('Tämä on tiedote'));
    await expectEventually(() => expect(app.find('.tile-content').html()).toContain('42'));
    await expectEventually(() => expect(app.find('.tile-content').html()).toContain('43'));
  });
});
