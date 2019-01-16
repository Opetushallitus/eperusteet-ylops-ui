import { Kieli } from '@/tyypit';
import { UiKielet, i18n, Kielet } from './kieli';
import { Ulkopuoliset } from '@/api';


describe('Kielet', () => {

  beforeEach(() => {
    i18n.locale = Kieli.fi;
    Kielet.setSisaltoKieli(Kieli.fi);
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
    expect(i18n.t('kieli-sisalto')).toEqual('sisältö');
    i18n.locale = Kieli.sv;
    expect(i18n.t('kieli-sisalto')).toEqual('innehåll');
  });

  test('Käännösten lataus', async () => {
    const spy = jest.spyOn(Ulkopuoliset, 'getLokalisoinnit');
    spy.mockImplementationOnce(async () => {
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
    spy.mockImplementationOnce(async () => {
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
