import { mount, createLocalVue } from '@vue/test-utils';
import { Kayttajat } from '@/stores/kayttaja';
import { router } from '@/router';
import { expectEventually } from '&/utils/assertions';
import { getRootConfig } from '@/mainvue';
import { Kielet } from '@shared/stores/kieli';
import VueI18n from 'vue-i18n';
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

import '@/config/bootstrap';
import '@/config/fontawesome';

describe('Router', () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  Kielet.install(localVue);
  localVue.use(new Kaannos());

  async function createMounted(
    oikeudet = genOikeudet('oph')
  ) {
    jest.spyOn(KayttajatApi, 'getKayttaja')
      .mockImplementation(async () => makeAxiosResponse(genKayttaja()));

    jest.spyOn(Opetussuunnitelmat, 'getOikeudet')
      .mockImplementation(async () => makeAxiosResponse(oikeudet));

    jest.spyOn(KayttajatApi, 'getKayttajanEtusivu')
      .mockImplementation(async () => makeAxiosResponse({
        opetussuunnitelmatJulkaistut: 42,
        opetussuunnitelmatKeskeneraiset: 43,
        pohjatJulkaistut: 44,
        pohjatKeskeneraiset: 45,
      }));

    jest.spyOn(KayttajatApi, 'getOrganisaatioOikeudet')
      .mockImplementation(async () => makeAxiosResponse([
        '1234',
        '2234',
      ]));

    jest.spyOn(Ulkopuoliset, 'getUserOrganisations')
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

    jest.spyOn(Ulkopuoliset, 'getOrganisaatioVirkailijat')
      .mockImplementation(async () => makeAxiosResponse([]));

    jest.spyOn(Opetussuunnitelmat, 'getAll')
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

    jest.spyOn(Opetussuunnitelmat, 'getAdminList')
      .mockImplementation(async (): Promise<any> => [
      ]);

    jest.spyOn(Ulkopuoliset, 'getLokalisoinnit')
      .mockImplementation(async () => makeAxiosResponse({}));

    jest.spyOn(Ulkopuoliset, 'getTiedotteetHaku')
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
    return mount(await getRootConfig(), {
      localVue,
    });
  }

  beforeEach(async () => {
    return router.push({
      name: 'root',
      params: {
        lang: 'fi',
      },
    });
  });

  test('App creation', async () => {
    const spyWarn = jest.spyOn(console, 'warn');
    const spyError = jest.spyOn(console, 'error');
    const app = await createMounted();
    expect(spyError).not.toBeCalled();
    expect(spyWarn).not.toBeCalled();
  });

  test('Navigaatio - Etusivu', async () => {
    const app = await createMounted();
    expect(router.currentRoute.name).toEqual('root');
    expect(router.currentRoute.params).toEqual({ lang: 'fi' });
    router.push({
      name: 'root',
      params: { lang: 'sv' },
    });

    await localVue.nextTick();

    // expect(router.currentRoute.params).toEqual({ lang: 'sv' });

    await expectEventually(() =>
      expect(app.html()).toContain('Hej Keke Käyttäjä, välkommen till läroplansverktyget i eGrunder!'));
    await expectEventually(() => expect(app.html()).toContain('Tämä on tiedote'));
    await expectEventually(() => expect(app.find('.tile-content').html()).toContain('42'));
    await expectEventually(() => expect(app.find('.tile-content').html()).toContain('43'));
  });
});
