import _ from 'lodash';
import { Store, Getter, State } from '@shared/stores/store';
import { KayttajanTietoDto } from '@/tyypit';
import {
  Kayttajat as KayttajatApi,
  Opetussuunnitelmat,
  Ulkopuoliset,
} from '@/api';
import { organizations } from '@/utils/organisaatiot';

import { createLogger } from './logger';
const logger = createLogger('Kayttaja');

// FIXME: tyypitä backendiin
export type Oikeus = 'luku' | 'kommentointi' | 'muokkaus' | 'luonti' | 'poisto' | 'tilanvaihto' | 'hallinta';
export type OikeusKohde = 'opetussuunnitelma' | 'pohja';
export interface Oikeudet { [kohde: string]: Oikeus[]; }

function getOikeusArvo(oikeus: Oikeus) {
  switch (oikeus) {
  case 'luku': return 1;
  case 'kommentointi': return 2;
  case 'muokkaus': return 3;
  case 'luonti': return 4;
  case 'poisto': return 5;
  case 'tilanvaihto': return 6;
  default: return 0;
  }
}

export function parsiEsitysnimi(tiedot: any): string {
  if (tiedot.kutsumanimi && tiedot.sukunimi) {
    return tiedot.kutsumanimi + ' ' + tiedot.sukunimi;
  }
  else {
    return tiedot.oidHenkilo as string;
  }
}

@Store
class KayttajaStore {
  @State()
  public organisaatiot: string[] = [];

  @State()
  public tiedot: KayttajanTietoDto = { };

  @State()
  public virkailijat: any[] = []; // FIXME: tyyppi puuttuu

  @State()
  public oikeudet: Oikeudet = {
    opetussuunnitelma: [],
    pohja: [],
  };

  @Getter()
  public nimi() {
    return parsiEsitysnimi(this.tiedot);
  }

  public async init() {
    try {
      logger.info('Haetaan käyttäjän tiedot');
      this.tiedot = (await KayttajatApi.getKayttaja()).data;
      this.organisaatiot = (await KayttajatApi.getOrganisaatioOikeudet()).data;
      const oikeudet = (await Opetussuunnitelmat.getOikeudet()).data;
      this.oikeudet = (oikeudet as any);
      logger.info('Käyttäjän tiedot', this.tiedot);
      logger.info('Käyttäjän oikeudet', this.oikeudet);
    }
    catch (err) {
      logger.error('Käyttäjän tietojen lataus epäonnistui', err.message);
    }
  }

  public async updateOrganisaatioVirkailijat() {
    const orgIds = _.filter(this.organisaatiot, oid => oid !== organizations.oph.oid);
    this.virkailijat = (await Ulkopuoliset.getOrganisaatioVirkailijat(orgIds)).data as any[];
  }

  public async hasOikeus(oikeus: Oikeus, kohde: OikeusKohde = 'opetussuunnitelma') {
    if (!oikeus) {
      return false;
    }
    else if (oikeus === 'hallinta') {
      return this.hasHallintaoikeus();
    }
    else {
      return this.vertaa(oikeus, kohde);
    }
  }

  public async getEtusivu() {
    const result = (await KayttajatApi.getKayttajanEtusivu()).data;
    return result;
  }

  private vertaa(oikeus: Oikeus, kohde: OikeusKohde = 'opetussuunnitelma') {
    const haettu = getOikeusArvo(oikeus);
    if (haettu === 0) {
      return false;
    }
    else {
      const korkein = _.max(_.map(this.oikeudet[kohde], getOikeusArvo)) || 0;
      return korkein >= haettu;
    }
  }

  private hasHallintaoikeus() {
    return _.includes(this.oikeudet['pohja' as OikeusKohde], 'luonti');
  }
}

export const Kayttajat = new KayttajaStore();
