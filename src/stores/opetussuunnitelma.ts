import { Ohjeet, OpetussuunnitelmanSisalto, Opintojaksot, Oppiaineet, Opetussuunnitelmat, Lops2019Perusteet } from '@/api';
import { Matala, Lops2019PaikallinenOppiaineDto, Lops2019OppiaineDto, Lops2019ModuuliDto, Lops2019OpintojaksoDto, OhjeDto, OpetussuunnitelmaKevytDto, Puu, TekstiKappaleViiteKevytDto } from '@/tyypit';
import { AxiosResponse } from 'axios';
import { createLogger } from './logger';
import { State, Store } from './store';
import Vue from 'vue';
import _ from 'lodash';

const logger = createLogger('Opetussuunnitelma');

interface Referencable {
  id?: number;
}

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

  @State()
  public paikallisetOppiaineet: Lops2019PaikallinenOppiaineDto[] = [];

  @State()
  public opintojaksot: Lops2019OpintojaksoDto[] = [];

  private opsId: number | null = null;
  private initcv: Promise<void> | null = null;

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
    if (this.opsId === id) {
      if (this.initcv) {
        await this.initcv;
      }
    }
    else {
      this.opsId = id;
      this.initcv = new Promise(async (resolve) => {
        logger.info('Initing peruste rakenne', id);
        this.opetussuunnitelma = await this.get(id);
        await this.updateSisalto();
        this.opintojaksot = (await Opintojaksot.getAllOpintojaksot(this.opetussuunnitelma!.id!)).data;
        this.paikallisetOppiaineet = await this.getPaikallisetOppiaineet();
        logger.info('Inited peruste rakenne');
        this.initcv = null;
        resolve();
      });
      await this.initcv;
    }
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

  public async removeTeksti(tov: Puu) {
    await OpetussuunnitelmanSisalto.removeTekstiKappaleViite(this.opetussuunnitelma!.id!, tov.id!);
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
  // Pilko omiin moduuleihin

  // Paikalliset oppiaineet
  public async addOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto = {}) {
    const result = (await Oppiaineet.addLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine)).data;
    this.paikallisetOppiaineet = [...this.paikallisetOppiaineet, result];
    return result;
  }

  public async getPaikallinenOppiaine(id: number) {
    return (await Oppiaineet.getLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallisetOppiaineet() {
    const paikalliset = (await Oppiaineet.getAllLops2019PaikallisetOppiainet(this.opetussuunnitelma!.id!)).data;
    return paikalliset;
  }

  public async savePaikallinenOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto) {
    const result = (await Oppiaineet.updateLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine.id!, oppiaine)).data;
    const idx = _.findIndex(this.paikallisetOppiaineet, { id: result.id });
    this.paikallisetOppiaineet = [
      ..._.slice(this.paikallisetOppiaineet, 0, idx),
      result,
      ..._.slice(this.paikallisetOppiaineet, idx + 1),
    ];
    return result;
  }

  // Opintojaksot
  public async addOpintojakso(opintojakso: Lops2019OpintojaksoDto = {}) {
    const result = (await Opintojaksot.addOpintojakso(this.opetussuunnitelma!.id!, opintojakso)).data;
    this.opintojaksot = [...this.opintojaksot, result];
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
    const idx = _.findIndex(this.opintojaksot, { id: result.id });
    this.opintojaksot = [
      ..._.slice(this.opintojaksot, 0, idx),
      result,
      ..._.slice(this.opintojaksot, idx + 1),
    ];
    return result;
  }
}

export const Opetussuunnitelma = new OpetussuunnitelmaStore();
