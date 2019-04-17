import { Ohjeet, OpetussuunnitelmanSisalto, Opintojaksot, Oppiaineet, Opetussuunnitelmat, Lops2019Perusteet } from '@/api';
import { Matala, Lops2019PaikallinenOppiaineDto, Lops2019OppiaineDto, Lops2019ModuuliDto, Lops2019OpintojaksoDto, OhjeDto, OpetussuunnitelmaKevytDto, Puu, TekstiKappaleViiteKevytDto } from '@/tyypit';
import { AxiosResponse } from 'axios';
import { createLogger } from './logger';
import { State, Store } from './store';
import _ from 'lodash';

const logger = createLogger('Opetussuunnitelma');

interface OpintojaksoQuery {
  oppiaineUri?: string;
  moduuliUri?: string;
}

@Store
class OpetussuunnitelmaStore {
  @State()
  public sisalto: TekstiKappaleViiteKevytDto | null = null;

  @State()
  public opetussuunnitelma: OpetussuunnitelmaKevytDto | null = null;

  public async getOtsikot() {
    if (this.opetussuunnitelma && this.opetussuunnitelma.id) {
      return (await OpetussuunnitelmanSisalto.getTekstiOtsikot(this.opetussuunnitelma.id)).data;
    }
    else {
      return null;
    }
  }

  public async updateSisalto() {
    this.sisalto = await this.getOtsikot();
  }

  public async init(id: number) {
    logger.info('Updating peruste', id);
    this.opetussuunnitelma = await this.get(id);
    await this.updateSisalto();
    logger.info('Updating peruste', this.sisalto);
  }

  public async get(id: number) {
    return (await Opetussuunnitelmat.getOpetussuunnitelma(id)).data;
  }

  public async save(opetussuunnitelma: OpetussuunnitelmaKevytDto) {
    try {
      const res = await Opetussuunnitelmat.updateOpetussuunnitelma(opetussuunnitelma.id as number, opetussuunnitelma);
      this.opetussuunnitelma = res.data;
    }
    catch (err) {
      logger.error(err);
    }
  }

  public async addTeksti(tov: Puu, parentId?: number) {
    let osa: AxiosResponse<Matala>;
    if (parentId) {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappaleLapsi(this.opetussuunnitelma!.id!, parentId, tov);
    }
    else {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappale(this.opetussuunnitelma!.id!, tov);
    }
    await this.updateSisalto();
    return osa.data;
  }

  public async updateTila(uusiTila: string) {
    if (uusiTila) {
      await Opetussuunnitelmat.updateTila(this.opetussuunnitelma!.id!, uusiTila as any);
      this.opetussuunnitelma = {
        ...this.opetussuunnitelma!,
        tila: uusiTila as any,
      };
    }
  }

  public async saveTeksti(tov: Puu) {
    await OpetussuunnitelmanSisalto.updateTekstiKappaleViite(this.opetussuunnitelma!.id!, tov.id!, tov);
    await this.updateSisalto();
  }

  public async saveOhje(ohje: OhjeDto) {
    if (ohje.id) {
      const res = await Ohjeet.updateOhje(ohje.id, ohje);
      return res.data;
    }
    else {
      const res = await Ohjeet.addOhje(ohje);
      return res.data;
    }
  }

  // Lops 2021

  // Paikalliset oppiaineet
  public async addOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto = {}) {
    const result = (await Oppiaineet.addLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine)).data;
    return result;
  }

  public async getPaikallinenOppiaine(id: number) {
    return (await Oppiaineet.getLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallisetOppiaineet() {
    return (await Oppiaineet.getAllLops2019PaikallisetOppiainet(this.opetussuunnitelma!.id!)).data;
  }

  public async savePaikallinenOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto) {
    const result = (await Oppiaineet.updateLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine.id!, oppiaine)).data;
    return result;
  }

  // Opintojaksot
  public async addOpintojakso(opintojakso: Lops2019OpintojaksoDto = {}) {
    const result = (await Opintojaksot.addOpintojakso(this.opetussuunnitelma!.id!, opintojakso)).data;
    await this.updateSisalto();
    return result;
  }

  public async getOpintojaksot(query: OpintojaksoQuery = {}) {
    let chain = _((await Opintojaksot.getAllOpintojaksot(this.opetussuunnitelma!.id!)).data);
    if (query.oppiaineUri) {
      chain = chain.filter(oj => _.includes(oj.oppiaineet, query.oppiaineUri));
    }
    if (query.moduuliUri) {
      chain = chain.filter(oj => _.includes(
        _.map(oj.moduulit, 'koodiUri'),
        query.oppiaineUri));
    }
    return chain.value();
  }

  public async getOpintojaksoHistoria(opintojaksoId: number) {
    return (await Opintojaksot.getVersionHistory(this.opetussuunnitelma!.id!, opintojaksoId)).data;
  }

  public async getOpintojakso(id: number) {
    const result = (await Opintojaksot.getOpintojakso(this.opetussuunnitelma!.id!, id)).data;
    return result;
  }

  public async saveOpintojakso(opintojakso: Lops2019OpintojaksoDto) {
    const result = (await Opintojaksot.updateOpintojakso(this.opetussuunnitelma!.id!, opintojakso.id!, opintojakso)).data;
    return result;
  }
}

export const Opetussuunnitelma = new OpetussuunnitelmaStore();
