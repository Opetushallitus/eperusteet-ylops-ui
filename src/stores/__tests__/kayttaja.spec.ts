import { Kayttajat } from '../kayttaja';

describe('Kayttajat', () => {
  beforeEach(() => {
    Kayttajat.oikeudet = {
      opetussuunnitelma: [],
      pohja: [],
    };
  });

  test('Tyhjät oikeudet', async () => {
    expect(await Kayttajat.hasOikeus('luku')).toEqual(false);
    expect(await Kayttajat.hasOikeus('hallinta')).toEqual(false);
    expect(await Kayttajat.hasOikeus('hallinta', 'pohja')).toEqual(false);
    expect(await Kayttajat.hasOikeus('luku', 'pohja')).toEqual(false);
    expect(await Kayttajat.hasOikeus('tilanvaihto', 'opetussuunnitelma')).toEqual(false);
  });

  test('Hallintaoikeudet', async () => {
    Kayttajat.oikeudet = {
      opetussuunnitelma: [],
      pohja: ['luonti'],
    };

    expect(await Kayttajat.hasOikeus('hallinta', 'pohja')).toEqual(true);
    expect(await Kayttajat.hasOikeus('luku', 'pohja')).toEqual(true);
  });

  test('Rikkinäisillä parametreilla ei oikeuksia', async () => {
    expect(await Kayttajat.hasOikeus(null as any, 'opetussuunnitelma')).toEqual(false);
    expect(await Kayttajat.hasOikeus('luku', null as any)).toEqual(false);
    expect(await Kayttajat.hasOikeus(null as any, null as any)).toEqual(false);
    expect(await Kayttajat.hasOikeus('keksitty' as any)).toEqual(false);
  });

  test('Opetussuunnitelman lukuoikeudet', async () => {
    Kayttajat.oikeudet = {
      opetussuunnitelma: ['luku'],
      pohja: [],
    };
    expect(await Kayttajat.hasOikeus('luku', 'pohja')).toEqual(false);
    expect(await Kayttajat.hasOikeus('luku', 'opetussuunnitelma')).toEqual(true);
    expect(await Kayttajat.hasOikeus('kommentointi', 'opetussuunnitelma')).toEqual(false);
  });

  test('Opetussuunnitelman muokkausoikeus', async () => {
    Kayttajat.oikeudet = {
      opetussuunnitelma: ['muokkaus'],
      pohja: [],
    };

    expect(await Kayttajat.hasOikeus('luku', 'pohja')).toEqual(false);
    expect(await Kayttajat.hasOikeus('luku', 'opetussuunnitelma')).toEqual(true);
    expect(await Kayttajat.hasOikeus('kommentointi', 'opetussuunnitelma')).toEqual(true);
    expect(await Kayttajat.hasOikeus('muokkaus', 'opetussuunnitelma')).toEqual(true);
    expect(await Kayttajat.hasOikeus('luonti', 'opetussuunnitelma')).toEqual(false);
    expect(await Kayttajat.hasOikeus('poisto', 'opetussuunnitelma')).toEqual(false);
  });
});
