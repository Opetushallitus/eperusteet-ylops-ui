import _ from 'lodash';
import { reactive, computed } from 'vue';
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
import { parsiEsitysnimi } from '@shared/utils/kayttaja';

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
  case 'hallinta': return 7;
  default: return 0;
  }
}

const logger = createLogger('Kayttaja');

export class KayttajaStore {
  private state = reactive({
    tiedot: {} as KayttajanTietoDto,
    virkailijat: null as any[] | null, // FIXME: tyyppi puuttuu
    oikeudet: {
      opetussuunnitelma: [],
      pohja: [],
    } as Oikeudet,
    casKayttaja: null as any | null,
  });

  public readonly tiedot = computed(() => this.state.tiedot);
  public readonly virkailijat = computed(() => this.state.virkailijat);
  public readonly oikeudet = computed(() => this.state.oikeudet);
  public readonly casKayttaja = computed(() => this.state.casKayttaja);
  public readonly nimi = computed(() => parsiEsitysnimi(this.state.tiedot));
  public readonly sovellusOikeudet = computed(() => getSovellusoikeudet(this.state.casKayttaja?.groups, 'APP_EPERUSTEET_YLOPS'));

  public async init() {
    logger.info('Haetaan käyttäjän tiedot');
    this.state.casKayttaja = await getCasKayttaja();
    this.state.tiedot = (await KayttajatApi.getKayttaja()).data;
    logger.info('Käyttäjän tiedot', this.state.tiedot);
    await delay(1000); // EP-2371
    this.state.oikeudet = ((await Opetussuunnitelmat.getOikeudet()).data as any);
    logger.info('Käyttäjän oikeudet', this.state.oikeudet);
  }

  public async fetchOrganisaatioVirkailijat() {
    const organisaatiot = (await Ulkopuoliset.getUserOrganisations()).data;
    const orgIds = _(organisaatiot)
      .filter((org: any) => org.oid !== organizations.oph.oid)
      .map((org: any) => org.oid)
      .value();
    this.state.virkailijat = (await Ulkopuoliset.getOrganisaatioVirkailijat(orgIds)).data as any[];
  }

  public async fetchVirkailijatByOrganisaatio() {
    const organisaatiot = (await Ulkopuoliset.getUserOrganisations()).data;
    const res = _.map(await Promise.all(_(organisaatiot)
      .filter((org: any) => org.oid !== organizations.oph.oid)
      .map((org: any) => org.oid)
      .map(oid => Ulkopuoliset.getOrganisaatioVirkailijat([oid]))
      .value()), 'data');

    const virkailijat: any[] = [];
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
    this.state.virkailijat = virkailijat;
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
      const korkein = _.max(_.map(this.state.oikeudet[kohde], getOikeusArvo)) || 0;
      return korkein >= haettu;
    }
  }

  private hasHallintaoikeus(kohde) {
    return _.includes(this.state.oikeudet[kohde], 'hallinta');
  }
}

export const Kayttajat = new KayttajaStore();
