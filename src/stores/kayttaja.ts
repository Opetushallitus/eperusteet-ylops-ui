import _ from 'lodash';
import { Store, Getter, State } from '@shared/stores/store';
import { KayttajanTietoDto,
  Kayttajat as KayttajatApi,
  Opetussuunnitelmat,
  Ulkopuoliset,
} from '@shared/api/ylops';

import { organizations } from '@/utils/organisaatiot';
import { createLogger } from '@shared/utils/logger';
import { delay } from '@shared/utils/delay';
import { getCasKayttaja } from '@shared/api/common';
import { getSovellusoikeudet } from '@shared/plugins/oikeustarkastelu';

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
  public tiedot: KayttajanTietoDto = { };

  @State()
  public virkailijat: any[] | null = null; // FIXME: tyyppi puuttuu

  @State()
  public oikeudet: Oikeudet = {
    opetussuunnitelma: [],
    pohja: [],
  };

  @State()
  public casKayttaja: any | null = null;

  @Getter(state => parsiEsitysnimi(state.tiedot))
  public readonly nimi!: string;

  @Getter(state => getSovellusoikeudet(state.casKayttaja?.groups, 'APP_EPERUSTEET_YLOPS'))
  public readonly sovellusOikeudet!: any[];

  public async init() {
    logger.info('Haetaan käyttäjän tiedot');
    this.casKayttaja = await getCasKayttaja();
    this.tiedot = (await KayttajatApi.getKayttaja()).data;
    logger.info('Käyttäjän tiedot', this.tiedot);
    await delay(1000); // EP-2371
    this.oikeudet = ((await Opetussuunnitelmat.getOikeudet()).data as any);
    logger.info('Käyttäjän oikeudet', this.oikeudet);
  }

  public async fetchOrganisaatioVirkailijat() {
    const organisaatiot = (await Ulkopuoliset.getUserOrganisations()).data;
    const orgIds = _(organisaatiot)
      .filter((org: any) => org.oid !== organizations.oph.oid)
      .map((org: any) => org.oid)
      .value();
    this.virkailijat = (await Ulkopuoliset.getOrganisaatioVirkailijat(orgIds)).data as any[];
  }

  public async fetchVirkailijatByOrganisaatio() {
    const organisaatiot = (await Ulkopuoliset.getUserOrganisations()).data;
    const res = _.map(await Promise.all(_(organisaatiot)
      .filter((org: any) => org.oid !== organizations.oph.oid)
      .map((org: any) => org.oid)
      .map(oid => Ulkopuoliset.getOrganisaatioVirkailijat([oid]))
      .value()), 'data');

    let virkailijat: any[] = [];
    for (let i = 0; i < res.length; i++) {
      const organisaatio = organisaatiot[i];
      const orgVirkailijat = res[i];
      _.each(orgVirkailijat, virkailija => {
        const oid = (virkailija as any).oid;
        if (_.find(virkailijat, { oid })) {
          const virkailija = _.find(virkailijat, { oid });
          virkailija.organisaatiot.push(organisaatio);
        }
        else {
          virkailijat.push({
            ...(virkailija as any),
            organisaatiot: [organisaatio],
          });
        }
      });
    }
    this.virkailijat = virkailijat;
  }

  public hasOikeus(oikeus: Oikeus, kohde: OikeusKohde = 'opetussuunnitelma') {
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
