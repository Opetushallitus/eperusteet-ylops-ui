import Vue from 'vue';
import * as _ from 'lodash';
import { Store, Getter, Mutation, Action, State } from './store';
import { KayttajanTietoDto } from '@/tyypit';
import {
  Kayttajat as KayttajatApi,
  Opetussuunnitelmat,
} from '@/api';

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


@Store
class KayttajaStore {

  @State()
  public tiedot: KayttajanTietoDto = { };

  @State()
  public oikeudet: Oikeudet = {
    opetussuunnitelma: [],
    pohja: [],
  };

  public async init() {
    try {
      logger.info('Haetaan käyttäjän tiedot');
      this.tiedot = (await KayttajatApi.get()).data;
      const oikeudet = (await Opetussuunnitelmat.getOikeudet()).data;
      this.oikeudet = (oikeudet as any);
      logger.info('Käyttäjän tiedot', this.tiedot);
      logger.info('Käyttäjän oikeudet', this.oikeudet);
    }
    catch (err) {
      logger.error('Käyttäjän tietojen lataus epäonnistui', err.message);
    }
  }

  public async hasOikeus(oikeus: Oikeus, kohde: OikeusKohde = 'opetussuunnitelma') {
    if (!oikeus) {
      return false;
    }
    else if (oikeus === 'hallinta') {
      return _.includes(this.oikeudet['pohja' as OikeusKohde], 'luonti');
    }
    else {
      const haettu = getOikeusArvo(oikeus);
      if (haettu === 0) {
        return false;
      }
      else {
        const korkein = _.max(_.map(this.oikeudet[kohde], getOikeusArvo)) || 0;
        return korkein >= haettu;
      }
    }
  }

}

export const Kayttajat = new KayttajaStore();
