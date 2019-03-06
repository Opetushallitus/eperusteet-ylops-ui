import { mount, createLocalVue } from '@vue/test-utils';
import { Kielet, i18n } from '@/stores/kieli';
import { Kayttajat } from '@/stores/kayttaja';
import { router } from '@/router';
import { AxiosResponse } from 'axios';
import { expectEventually } from '&/utils/assertions';
import {
  makeAxiosResponse,
  genOikeudet,
  genKayttaja,
} from '&/utils/data';
import {
  OpetussuunnitelmaInfoDto,
} from '@/tyypit';

import {
  Kayttajat as KayttajatApi,
  Opetussuunnitelmat,
  Ulkopuoliset,
} from '@/api';

import App from '@/App.vue';

import '@/config/bootstrap';
import '@/config/fontawesome';

import { rootConfig } from '@/mainvue';


describe('Router', () => {
  async function createMounted(
    oikeudet = genOikeudet('oph'),
  ) {
    jest.spyOn(KayttajatApi, 'getKayttaja')
      .mockImplementation(async () => makeAxiosResponse(genKayttaja()));

    jest.spyOn(Opetussuunnitelmat, 'getOikeudet')
      .mockImplementation(async () => makeAxiosResponse(oikeudet));

    jest.spyOn(KayttajatApi, 'getOrganisaatioOikeudet')
      .mockImplementation(async () => makeAxiosResponse([
        '1234',
        '2234',
      ]));

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

    jest.spyOn(Ulkopuoliset, 'getTiedotteet')
      .mockImplementation(async () => makeAxiosResponse([{
        julkinen: true,
        yleinen: true,
        otsikko: { fi: 'Tämä on tiedote' },
        koulutustyyppi: 'koulutustyyppi_2',
      }]));

    await Kayttajat.init();
    return mount(rootConfig, {
      localVue: createLocalVue(),
    });
  }

  beforeEach(() => {
    router.push({
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

    expect(router.currentRoute.params).toEqual({ lang: 'sv' });

    await expectEventually(() =>
      expect(app.html()).toContain('Hei Keke Käyttäjä, tervetuloa ePerusteet OPS-työkaluun!'));
    await expectEventually(() => expect(app.html()).toContain('Jokin opetussuunnitelman pohja'));
    await expectEventually(() => expect(app.html()).toContain('Tämä on tiedote'));
  });

  // test('Navigation - ', async () => {
  //   const app = await createMounted();
  //   expect(router.currentRoute.name).toEqual('root');
  //   expect(router.currentRoute.params).toEqual({ lang: 'fi' });
  //   router.push({
  //     name: 'root',
  //     params: { lang: 'sv' },
  //   });
  //   expect(router.currentRoute.params).toEqual({ lang: 'sv' });
  // });

  // test('Navigation - Hallinta', async () => {
  //   router.push({
  //     name: 'admin',
  //     params: router.currentRoute.params,
  //   });
  // });

});
