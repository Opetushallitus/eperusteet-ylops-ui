import _ from 'lodash';
import { Store, Getter, State } from '@shared/stores/store';
import { KayttajanTietoDto } from '@/tyypit';
import {
  Kayttajat as KayttajatApi,
  Opetussuunnitelmat,
  Ulkopuoliset,
} from '@/api';
import { organizations } from '@/utils/organisaatiot';
import { createLogger } from '@shared/utils/logger';

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

const logger = createLogger('Kayttaja');

@Store
class KayttajaStore {
  @State()
  public organisaatiot: any[] = [];

  @State()
  public tiedot: KayttajanTietoDto = { };

  @State()
  public virkailijat: any[] = []; // FIXME: tyyppi puuttuu

  @State()
  public oikeudet: Oikeudet = {
    opetussuunnitelma: [],
    pohja: [],
  };

  @Getter(state => parsiEsitysnimi(state.tiedot))
  public readonly nimi!: string;

  public async init() {
    try {
      logger.info('Haetaan käyttäjän tiedot');
      this.tiedot = (await KayttajatApi.getKayttaja()).data;
      this.organisaatiot = (await Ulkopuoliset.getUserOrganisations()).data;
      const oikeudet = (await Opetussuunnitelmat.getOikeudet()).data;
      this.oikeudet = (oikeudet as any);
      logger.info('Käyttäjän tiedot', this.tiedot);
      logger.info('Käyttäjän oikeudet', this.oikeudet);
    }
    catch (err) {
      logger.error('Käyttäjän tietojen lataus epäonnistui', err.message);
    }
  }

  public async fetchOrganisaatioVirkailijat() {
    const orgIds = _(this.organisaatiot)
      .filter(org => org.oid !== organizations.oph.oid)
      .map(org => org.oid)
      .value();
    this.virkailijat = (await Ulkopuoliset.getOrganisaatioVirkailijat(orgIds)).data as any[];
  }

  public async fetchVirkailijatByOrganisaatio() {
    const res = await Promise.all(_(this.organisaatiot)
      .filter(org => org.oid !== organizations.oph.oid)
      .map(org => org.oid)
      .map(oid => Ulkopuoliset.getOrganisaatioVirkailijat([oid]))
      .value());
    const unwrapped = _(res)
      .map(el => el.data)
      .value();

    let virkailijat: any[] = [];
    for (let i = 0; i < unwrapped.length; i++) {
      const organisaatio =  this.organisaatiot[i];
      const orgVirkailijat = unwrapped[i];
      _.each(orgVirkailijat, virkailija => {
        const oid = virkailija.oid;
        if (_.includes(virkailijat, { oid })) {
          const virkailija = _.find(virkailijat, { oid });
          virkailija.organisaatiot.push(organisaatio);
        }
        else {
          virkailijat.push({
            ...virkailija,
            organisaatiot: [organisaatio],
          });
        }
      });
    }

    this.virkailijat = virkailijat;
  }

  public async hasOikeus(oikeus: Oikeus, kohde: OikeusKohde = 'opetussuunnitelma') {
    if (!oikeus) {
      return false;
    }
    else if (oikeus === 'hallinta') {
      return this.hasHallintaoikeus(kohde);
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

  private hasHallintaoikeus(kohde) {
    return _.includes(this.oikeudet[kohde], 'luonti');
  }
}

export const Kayttajat = new KayttajaStore();
