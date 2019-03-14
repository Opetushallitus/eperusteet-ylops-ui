import { Kieli } from '@/tyypit';
import { UiKielet, i18n, Kielet } from '../kieli';
import { Ulkopuoliset } from '@/api';
import _ from 'lodash';

const locales = {
  fi: require('@/translations/locale-fi.json'),
  sv: require('@/translations/locale-sv.json'),
};

describe('Kielet', () => {
  beforeEach(() => {
    i18n.locale = Kieli.fi;
    Kielet.setSisaltoKieli(Kieli.fi);
  });

  test('Käännökset kaikilla kielillä', () => {
    expect(_.sortBy(_.keys(locales.fi)))
      .toEqual(_.sortBy(_.keys(locales.sv)));
  });

  test('UI-kieli', async () => {
    expect(Kielet.getUiKieli()).toEqual(i18n.locale);
    i18n.locale = Kieli.sv;
    expect(Kielet.getUiKieli()).toEqual(i18n.locale);
  });

  test('Sisältökieli', async () => {
    expect(Kielet.getSisaltoKieli()).toEqual(Kieli.fi);

    Kielet.setSisaltoKieli(Kieli.sv);
    expect(Kielet.getSisaltoKieli()).toEqual(Kieli.sv);
  });

  test('Ui käännökset', async () => {
    const spy = jest.spyOn(Ulkopuoliset, 'getLokalisoinnit');
    spy.mockImplementationOnce(async (): Promise<any> => {
      return {
        data: {
          fi: [{
            key: 'kieli-sisalto',
            value: 'suomeksi',
          }],
          sv: [{
            key: 'kieli-sisalto',
            value: 'ruotsiksi',
          }],
        },
      };
    });

    await Kielet.init();
    expect(i18n.t('kieli-sisalto')).toEqual('suomeksi');
    i18n.locale = Kieli.sv;
    expect(i18n.t('kieli-sisalto')).toEqual('ruotsiksi');
  });

  test('Käännösten lataus', async () => {
    const spy = jest.spyOn(Ulkopuoliset, 'getLokalisoinnit');
    spy.mockImplementationOnce(async (): Promise<any> => {
      return {
        data: {
          fi: [{
            key: 'testiavain',
            value: 'testiarvo',
          }],
          sv: [],
        },
      };
    });
    await Kielet.init();

    expect(i18n.t('testiavain')).toEqual('testiarvo');
  });

  test('Käännösten lataus virheellisillä arvoilla', async () => {
    const spy = jest.spyOn(Ulkopuoliset, 'getLokalisoinnit');
    spy.mockImplementationOnce(async (): Promise<any> => {
      return {
        data: {
          fi: [{
            key: 'testiavain',
            value: 'testiarvo',
          }],
          sv: [{
            value: 'testiarvo',
          }, {
            key: 'testiavain',
          }],
          ru: [],
        },
      };
    });
    await Kielet.init();

    expect(i18n.t('testiavain')).toEqual('testiarvo');
  });

  test('Käännösten lataus apin ollessa rikki', async () => {
    const spy = jest.spyOn(Ulkopuoliset, 'getLokalisoinnit');
    spy.mockImplementationOnce(async () => {
      throw new Error('500');
    });

    const errorSpy = jest.spyOn(console, 'error');
    errorSpy.mockImplementationOnce((...args: any) => undefined);
    await Kielet.init();
    expect(errorSpy).toBeCalled();
  });
});
